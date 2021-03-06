   Task description : https://drive.google.com/open?id=1bNDmcOYrIw1sFGRFoSZZ6KTU0T4IGZZU

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

    Abstract : 
    This can handle requests to read, unzip & transform data 
       from 300mb txt.tar.gz file with 1.000.000 strings.
    Processor usage grows above 30% and memory usage on each request grows only on 50mb.
    

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
        
    Can't see performance increasing with htop while downloading. 
    Memory usage looks over ~5mb. 

    Fail here : 
        When 4GB file uploads but the specified title exists
        response time is 0m6.387s.
        It seems request body reads only after handling all 
        parts of the request. This is express-fileupload and multer problem.
        
    Read(single request) :
    
    $ time curl "http://localhost:3000/read?path=file.tar.gz&limit=1000000"
    
    shows :
    
        real	0m8.238s
        user	0m0.359s
        sys	    0m0.819s
    
    htop(ctop, top, etc)
        displays CPU% from 35% to 60%
                 MEM% 0.5


__Etc :__

    Postman test queries pinned in file exec_crud.postman_collection.json
    Import them into your app via 'File -> import'

Link to 4GB file on [this](https://itnext.io/using-node-js-to-read-really-really-large-files-pt-1-d2057fe76b33) article


