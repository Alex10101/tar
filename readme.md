__Usage :__

    Add database called "Tar" and collection called "files" in your MongoDB 
    or use my Mlab account specified in './server/.env'.
          After npm i run "node ." at ./server

    Then upload your file by POST request specified in postman file.
    This will add uploaded file in database with time "2019-02-15T12:31:36.846Z"
    You can change original filename by adding "specify" : ${new_name} in body.data

    Then specify your filename in body.path of GET /tar request.
    This create the readline interface with read stream of your file 
        .piped by zlib.createGunzip command.    


__Performance :__

    Rises from 10% to 50%(On 4 cores, too large i think). 
    The memory increasing from 1.9GB(min) to 3.1GB(max). 
    After downloading it decreases on 100 mb.

    Response time of uploading single 4GB file :
        First : 40.085 ms
                18.126 ms
                17.557 ms
                18.197 ms 

    Completely fail here : 
        When single 4GB file uploads but the specified title exists
        response time is 14.918 ms.
        It seems that request body reads only after handling all 
        parts of the request. This is express-fileupload and multer problem.



__Etc :__

    Postman test queries pinned in file exec_crud.postman_collection.json
    Import them into your app via 'File -> import'

Link to 4GB file on [this](https://itnext.io/using-node-js-to-read-really-really-large-files-pt-1-d2057fe76b33) article


