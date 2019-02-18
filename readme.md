Usage : Add database called Tar and collection called files.
		After npm i run "node ." at ./server

Then upload anything by POST request specified in postman file.
This will add uploaded file in database with time "2019-02-15T12:31:36.846Z"
You can change original filename(but not extension) by adding "specify" : ${new_name} in body.data
By default this is '42'.

Then restart server and deleted files will be displayed by console.log()

To extract .tar file specify their name by PUT query at /extract with path ${name} keys in body
After extracting sever redirect you into the temp folder (/tmp) with extracted archive.
Temp folder clears before every extracting process.

In /tmp query you can see temp folder and specify the pagination.
There you can read both files and folders specified in path key and specify pagination in listed files.




Postman test queries pinned in file exec_crud.postman_collection.json
Import them into your app via 'File -> import'

get('/') & get('/tmp') queries supports both req.body & req.query

/extract query support only filename; 
extracts .tar/.tar.gz files into /tmp directory

/tmp query support both /foldername & /folder/filename.asm

     app/fs/extract.js : Executes tar -xzvf  ${path} -C ../tmp --keep-old-files
    app/fs/readline.js : Just readline.createInterface.
app/fs/mongo-fs-del.js : The file for cron.
Removes expired files and exports database.

