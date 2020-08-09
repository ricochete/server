const Docker = require('dockerode')
const http = require('http')
const url = require('url')

const RuntimeStream = require('./RuntimeStream.js')

/* Docker API remote module*/
const docker = new Docker()


async function RunDockerImage(imageName) {
    let stdOut = new RuntimeStream()
    let stdErr = new RuntimeStream()
    let [err, container] = await docker.run(imageName, [], [stdOut, stdErr], { Tty: false })
    return {container: container, err: err, stdOut: stdOut.text, stdErr: stdErr.text}
}

/* Route Controller */
async function serveMux(req, res) {
    if (req.method == 'GET') {
        const urlObj = url.parse(req.url, parseQueryString=true)

        if (urlObj.pathname == '/invoke') {
            let image = await docker.getImage(urlObj.query.id).inspect().catch(() => {
                throw new Error("Cannot find image on local")
            })
            let result = await RunDockerImage(urlObj.query.id)
            
            /* Docker Runtime error */
            if (result.err.Error) 
                throw new Error("Something went wrong while running the image. Please try again later.")

            /* Container execution error */
            if (result.stdErr) 
                throw new Error("The container returned a standard error while executing. \n" + String(result.stdErr))        
            return result.stdOut
        }
        else {
            throw new Error("URI does not exist.")
        }
        
    }
}

http.createServer((req, res) => {
    serveMux(req, res).then(data => {
        res.write(data)
    })
    .then( () => {
        res.end()
    })
    .catch(err => {
        console.log(err)
        res.write(err.message)
        res.end()
    })
}).listen(8000)