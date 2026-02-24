import express, { Application, Request, Response } from 'express'


const app: Application = express()

app.use(express.urlencoded({extended:true}));

// Middleware to parse JSON bodies
app.use('api/v1/')


// Basic route
app.get('/', async(req:Request, res:Response) => {
    res.send('first route')
})

export default app;