const mongoose = require('mongoose')

mongoose.set('strictQuery', false)


const url = process.env.MONGODB_URI

console.log('connecting to', url)
mongoose.connect(url)

  .then(result => {
    console.log('connected to MongoDB')
    console.log(`Result: ${result}`)
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

function lenValidator(val) {
  return val.length > 7
}

function formValidator(val) {
  return /^\d{2,3}-\d+$/.test(val)
}

const validators = [
  { validator: lenValidator, message: 'Phone number must have at least 7 numbers separated by dash (-)!' }
  , { validator: formValidator, message: 'Phone number must be a two parter, 2-3 and >4 number separated by dash (-)! E.g. 242-5435' }
]

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    validate: validators,
    required: [true, 'User phone number required']
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})


module.exports = mongoose.model('Person', personSchema)