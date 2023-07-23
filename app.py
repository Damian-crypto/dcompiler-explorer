from flask import Flask, render_template, request
import compilers

app = Flask(__name__)
app.static_folder = 'static'

compilerData = {
    'gnu_cpp':  ['g++', 'C:/Apps/mingw64/bin/g++.exe'],
    'clangpp':  ['clang++', 'C:/Apps/mingw64/bin/clang++.exe'],
    'gnu_c':    ['gcc', 'C:/Apps/mingw64/bin/gcc.exe'],
    'java':     ['javac', 'C:/Apps/java/bin/javac.exe']
}

@app.route('/')
def index():
    data = {
        'title': 'DCompiler Explorer',
        'compilers': compilerData, 
        'languages': ['c++', 'c', 'java']
    }
    return render_template('index.html', data=data)

@app.route('/compile', methods=['POST'])
def compile():
    req_data = request.get_json()
    language = req_data['language']
    if language == 'c++':
        res = compilers.compileCPP(req_data, compilerData)
        return res
    else:
        print('Trying to compile with invalid compiler!')
    return '{}'

if __name__ == '__main__':
    app.run(debug=True)
