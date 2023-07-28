from flask import Flask, render_template, request, json
import compilers

app = Flask(__name__)
app.static_folder = 'static'

compilerData = {
    'gnu_cpp':  ['g++', 'C:/Apps/mingw64/bin/g++.exe'],
    'clangpp':  ['clang++', 'C:/Apps/mingw64/bin/clang++.exe'],
    'gnu_c':    ['gcc', 'C:/Apps/mingw64/bin/gcc.exe'],
    'java':     ['javac', 'C:/Apps/java/bin/javac.exe'],
    'python':   ['python', 'C:/Users/damian/AppData/Local/Programs/Python/Python311/python.exe']
}

@app.route('/')
def index():
    data = {
        'title': 'DCompiler Explorer',
        'compilers': compilerData,
        'languages': ['c++', 'c', 'java', 'python']
    }
    return render_template('index.html', data=data)

@app.route('/compile', methods=['POST'])
def compile():
    req_data = request.get_json()
    language = req_data['language']
    if language == 'c++':
        res = compilers.compileCPP(req_data, compilerData)
        return res
    elif language == 'java':
        res = compilers.compileJAVA(req_data, compilerData)
        return res
    elif language == 'python':
        res = compilers.compilePYTHON(req_data, compilerData)
        return res
    else:
        print('Trying to compile with invalid compiler!')
    
    res = {
        'server_error': 'Compiler not supported!'
    }
    return json.dumps(res)

if __name__ == '__main__':
    app.run(debug=True)
