from subprocess import Popen, PIPE
import threading
import json
import os

def compileCPP(req_data, compilerData):
    # Writing source code into a file
    curdir = os.getcwd()
    inputpath = f'{curdir}\\intermediate\\a.cpp'
    assemblypath = f'{curdir}\\intermediate\\a.s'
    executablepath = f'{curdir}\\intermediate\\a.exe'
    print(req_data)
    compiler = compilerData[req_data['compiler']][1]
    sourcecode = req_data['sourcecode']
    with open(inputpath, 'w') as file:
        file.write(sourcecode)

    res = {}
    try:
        # Step 1: compile the written source code
        success, stderr, stdout = True, None, None
        def createAssembly():
            try:
                nonlocal stderr, stdout, success
                compile_proc1 = Popen([compiler, inputpath, '-S', '-masm=intel', '-Og', '-o', assemblypath], stderr=PIPE, stdout=PIPE)
                stdout, stderr = compile_proc1.communicate()
                success = success and (True if compile_proc1.returncode == 0 else False)
            except Exception as err:
                print('Compilation process 1 failed!', err)

        def createExecutable():
            try:
                compile_proc2 = Popen([compiler, inputpath, '-o', executablepath])
                compile_proc2.communicate()
                nonlocal success
                success = success and (True if compile_proc2.returncode == 0 else False)
            except Exception as err:
                print('Compilation process 2 failed!')

        thread1 = threading.Thread(target=createAssembly)
        thread2 = threading.Thread(target=createExecutable)
        thread1.start()
        thread2.start()
        thread1.join()
        thread2.join()

        # Step 2: if the code is successfully compiled, then execute
        if success:
            exe_proc = Popen([executablepath], stderr=PIPE, stdout=PIPE)
            stdout, stderr = exe_proc.communicate()

            # Step 3: return the outputs of the compiler (output, errors)
            if stdout:
                lines = []
                with open(assemblypath, 'r') as asm:
                    lines = asm.readlines()
                res['compiler_output'] = stdout.decode(encoding='utf-8')
                res['assembly_output'] = str.join('', lines)
            if stderr:
                res['execution_error'] = stderr.decode(encoding='utf-8')
        else:
            if stdout:
                res['compiler_output'] = stdout.decode(encoding='utf-8')
            if stderr:
                res['compiler_error'] = stderr.decode(encoding='utf-8')
            
    except Exception as err:
        res['server_error'] = str(err)

    # Step 4: make the json object from the outputs and return
    return json.dumps(res)