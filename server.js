const express  = require( 'express' ),
      app      = express()

app.use( express.json() )
app.use( express.static( 'build' ) )

let files = {
  test : {code : "test = function() { \n console.log(\"obama\") \n}"}
}

app.post( '/save', function( request, response ) {
  let body = request.body
  files[body.name] = {code : body.code}
  console.log(body)
  console.log(files)
  sendFiles(response)
})

app.post('/load', function(request, response) {
  let name = request.body.name

  out = JSON.stringify(files[name])
  console.log(out)
  
  response.send( out )
})

app.get('/files', function(request, response) {
  sendFiles(response)
})

const sendFiles = function(response) {
  json = {
    files: Object.keys(files)
  }

  body = JSON.stringify(json)

  console.log("\nFILES:")
  console.log(body)
  response.send( body )
}

app.listen( 8080 )
