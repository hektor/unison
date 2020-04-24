const bcrypt = require('bcrypt')

const User = require('../../models/user.model')
const {
  validateSignup,
  validateSignin,
} = require('../../validation/auth.validator')

const initEndpoints = router => {
  /*
Signup*/

  router.post('/signup', async (req, res) => {
    const { email, password } = req.body

    const { error } = validateSignup(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    // Check if user is already in database
    const user = await User.findOne({ email })
    if (user) return res.status(400).json({ message: 'Email already in use' })

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    try {
      const user = await new User({ email, password: hashedPassword }).save()
      res.json({ userId: user._id })
    } catch (err) {
      res.status(400).json({ message: err })
    }
  })

  /*
Signin */

  router.post('/signin', async (req, res) => {
    const { email, password } = req.body

    const { error } = validateSignin(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    // Check if user in database
    const user = await User.findOne({ email })
    if (!user) return res.status(400).send('Invalid email or password')

    // Check password
    const isCorrectPassword = await bcrypt.compare(password, user.password)
    if (!isCorrectPassword)
      return res.status(400).send('Invalid email or password')

    res.json({ message: 'You are signed in' })
  })
}

module.exports = initEndpoints
