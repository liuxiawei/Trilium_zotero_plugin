# Trillium_zotero_plugin

在Trillium中使用Zotero插入引用文献！

Make it passable to cite documen in trillium from zetore!

![Alt text](image.png)



**Welcome for pull request or fork and recreate**

# Usage
将鼠标移动到需要添加引用的地方后按“alt+shift+x”会弹出zotero选择框，选择文献后即可。

After moving the mouse to the desired location where you want to add a citation, press "Alt+Shift+X" to activate the Zotero selection dialog. Once you select the reference, it will be inserted at that location.


# Install
**该插件依赖Better BibTeX for Zotero，请参考[安装指南](https://retorque.re/zotero-better-bibtex/installation/index.html)进行安装**


创建一个类型为JS frontend类型的trillium note，将add_zotero_cite.js的内容作为note 的内容，然后重新启动trillium.

**This plugin depends on Better BibTeX for Zotero. Please refer to [this link](https://retorque.re/zotero-better-bibtex/installation/index.html) for installation instructions.**

1.Open Trillium and navigate to the section where you want to create the note.

2.Click on the "New Note" button or use the keyboard shortcut to create a new note.

3.In the note editor, set the type of the note as "JS frontend".

4.Copy the contents of add_zotero_cite.js and paste it into the content area of the note.

5.Save the note.

6.Restart Trillium to ensure the changes take effect.

# Export

**Export依赖trilium-py，请参考[安装指南](https://github.com/Nriver/trilium-py#-installation)进行安装**

**Export depends on  trilium-py，Please refer to [this link](https://github.com/Nriver/trilium-py#-installation)for installation instructions.**


请编辑config.ini文件设置参数。

Please edit the config.ini file to set the parameters.

``` bash
python export.py trilium_id
```


# Problem known

- After opening the note, you may need to wait for approximately 3 seconds for the JS plugin to load : 打开笔记后需要等待约3s加载js插件
- Lack of a more user-friendly interface: 缺乏更友好的界面
- Lack of export functionality: 缺乏导出功能
- Lack of testing for special content: 缺乏对特殊内容的测试

# todo
- make it more user-friendly

# Update log
2023.11.22 initial the project
2023.11.30 add export
