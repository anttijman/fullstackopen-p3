require('dotenv').config()
const express = require('express')
var morgan = require('morgan')
const app = express()
app.use(express.static('dist'))
const Person = require('./models/person')

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

morgan.token('body', function getBody (req) {
    return JSON.stringify(req.body)
})

app.use(express.json())
// Dunno if required by the exercise, but the body could be exempted from logging on request methods other than POST by using skip and split logging
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/api/persons', (request, response) => {
  Person.find({}).then(people => {
    response.json(people)
  })
})

app.get('/info', (request, response) => {
    const date = new Date()
    Person.countDocuments({}).then(count => {
      response.send(`Phonebook has info for ${count} people <br/><br/> ${date.toString()}`)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
  .then(person => {

    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  })

  .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
  .then(result => {
    response.status(204).end()
  })
  .catch(error => next(error))
})

const generateId = () => {
    const id = Math.floor(Math.random() * 10000)
    return String(id)
  }

app.post('/api/persons', (request, response, next) => {
    const body = request.body

    if (!body.number) {
        return response.status(400).json({ 
        error: 'number missing' 
        })
    }

    /* const already_exists = persons.find(person => person.name === body.name)

    if (already_exists) {
        return response.status(400).json({ 
            error: 'name must be unique' 
        })
    } */

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save().then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => (next(error)))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findById(request.params.id)
    .then(person => {
      if (!person) {
        return response.status(404).end()
      }

      person.name = name
      person.number = number

      return person.save().then((updatedPerson) => {
        response.json(updatedPerson)
      })
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})