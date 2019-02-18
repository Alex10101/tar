<span style="font-family:Papyrus; font-size:5em;">

__Usage :__

    Add database called "Tar" and collection called "files" in your MongoDB 
    or use my Mlab account specified in './server/.env'.
          After npm i run "node ." at ./server

    Then upload your file by POST request specified in postman file(exec_crud.postman_collection.json).
    This will add uploaded file in database with time "2019-02-15T12:31:36.846Z"
    You can change original filename by adding "specify" : ${new_name} in body.data
    By default this is '42'.

    Then you can restart the server or download new file and deleted files will be displayed in terminal.
    (I think this is the cron job. If you have argued different opinion please tell me about it)

    To extract .tar file specify their name by PUT query at /extract with path ${name} keys in body.
    After extracting sever redirect you into the temp folder (/tmp) with an extracted archive.
    Temp folder clears before every extracting process.

    In /tmp query you can see the temp folder and specify the pagination.
    There you can read both files and folders specified in path key and specify pagination in listed files.



__Performance :__

    Rises from 10% to 50%(On 4 cores that too much i think). 
    The memory increasing from 1.7GB(min) to 2.3GB(max). 
    After downloading it decreases on 150 mb.

    Response time of uploading single 4GB file :
     First :  37.017 ms  
              15.522 ms 
              14.714 ms  
              15.391 ms 
              
    Data from 1000 get requests of postman runner :
             Average response time : 5.418
             
    This is not clean data because i runned both postman and server
    on single machine. No one in my office knows how
    to make http requests on local network so for now i'm done.


  __Completely fail here__ : 
    When single 4GB file uploads but the specified title exists
    response time is 14.918 ms.
    It seems that request body reads only after handling all 
    parts of the request. This is express-fileupload and multer problem.



__Etc :__

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

   Link to 4GB file on [this](https://itnext.io/using-node-js-to-read-really-really-large-files-pt-1-d2057fe76b33) article.
    
  </span>

