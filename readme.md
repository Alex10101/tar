Usage : Add database called Tar and collection called files.
		After installation run node . at ./server

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

