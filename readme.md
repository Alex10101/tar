
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
        
    cron.js removes expired files. 
    As it goes from filename i think this is the cron job.


__Performance :__

   Requesting 1.000.000 strings puts almost 1GB callbacks in memory.
   With pm2 this can handle 10 parallel requests.

    Upload(single request sending 4GB file):
    
~~~~
$ time curl -H "Content-Type: multipart/form-data"  \
-F 'data={"specify" : "434.txt", "name":"1.tar.gz","title":"Saple title","description":"Sample Description","expired":"2019-02-15T12:31:36.846Z"}' \
-F "file=@./itcont.txt" \
localhost:3000
~~~~ 
    Shows :
        real 0m7.650s
        user 0m1.106s
        sys	0m2.684s
        
    I can't see performance or memory increasing with htop. 
    This dosen't grow. 

    Fail here : 
        When 4GB file uploads but the specified title exists
        response time is 0m6.387s.
        It seems request body reads only after handling all 
        parts of the request. This is express-fileupload and multer problem.
        
    Read(single request) :
    
    $ time curl "http://localhost:3000/read?path=file.tar.gz&limit=300000"
    
    shows :
    
        real	0m8.238s
        user	0m0.359s
        sys	    0m0.819s
    
    htop(ctop, top, etc)
        displays CPU% from 35% to 60%
                 MEM% 0.5% o_O
                 


__Etc :__

    Postman test queries pinned in file exec_crud.postman_collection.json
    Import them into your app via 'File -> import'

Link to 4GB file on [this](https://itnext.io/using-node-js-to-read-really-really-large-files-pt-1-d2057fe76b33) article


