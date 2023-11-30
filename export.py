from trilium_py.client import ETAPI
import configparser
import subprocess
import re
import os
import sys

# 获取命令行参数列表
args = sys.argv
# for arg in args:
#     print(arg)
if len(args)==1:
    print("usage: python export.py trilium_note_id\nexample:  python3 export.py 2j4LY8rPeMHX")
    exit()
note_id=str(args[1])
script_dir = os.path.dirname(os.path.realpath(__file__))

# 创建 ConfigParser 对象
config = configparser.ConfigParser()
# 读取配置文件
# config_file='/data/data/dev/Trillium_zotero_plugin/config.ini'
config_file="config.ini"
file_path = os.path.join(script_dir, config_file)
print(file_path)
config.read(file_path)

ea=None
# print(config)
# 获取配置值
output_file = config.get('output', 'output_file')
lua_filter = config.get('output', 'lua_filter')


server_url = config.get('server', 'server_url')
if config.has_option('server', 'token') and config.get('server','token').strip():
    token = config.get('server','token').strip().replace("\"", "")
    ea = ETAPI(server_url, token)

if not ea and config.has_option('server', 'password'):
    print("test")
    password = config.get('server','password').strip()
    ea = ETAPI(server_url)
    token = ea.login(password)
    print(token)
    config.set('server', 'token', token)
    config.set('server', 'password', '# ' + config.get('server', 'password'))
    # 将更新后的配置写入文件
    with open(config_file, 'w') as configfile:
        config.write(configfile)



# note_content=ea.get_note_content("7j4LY8rPeMHT")
note_content=ea.get_note_content(note_id)
command = ['pandoc', '-f', 'html', '-t', 'markdown']
process = subprocess.Popen(command, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
stdout, stderr = process.communicate(input=note_content.encode('utf-8'))

# 解码转换后的 Markdown 内容
markdown_content = stdout.decode('utf-8')

pattern = r'\[([^]]+)\]\(([^)]+)#zotero#([^)]+)\)'
citations = re.findall(pattern, markdown_content, flags=re.DOTALL)

for citation in citations:
    citename = citation[0].strip()
    title = citation[1].strip()
    citekey = citation[2].strip()
    full_content = "[%s](%s#zotero#%s)"%(citename, title, citekey)
    # citations.append((citename, citekey, full_content))
    markdown_content=markdown_content.replace(full_content, "[@%s]"%(citekey.replace("\n", ""),))

regex = r'\[@[^][]+\](?:\[\@[^][]+\])+'
matches = re.findall(regex, markdown_content)
for i in matches:
    markdown_content=markdown_content.replace("][", ";")



# 构建pandoc命令
command = [
    'pandoc',
    '-f',
    'markdown',
    '-t',
    'docx',
    '--lua-filter=' + lua_filter,
    '-o',
    output_file
]

# 执行pandoc命令
process = subprocess.Popen(command, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
stdout, stderr = process.communicate(input=markdown_content.encode('utf-8'))

# 检查是否有错误输出
if stderr:
    print("Error:", stderr.decode('utf-8'))
else:
    print("Conversion successful!")
    
    