const router = require('express').Router()
require('express-async-errors')
const { User, Blog, ReadingList, BlogsList} = require('../models')

const userFinder = async (req, res, next) => {
    if(req.query.read) {
        req.user = await User.findByPk(req.params.id, {
            attributes:['username', 'name'],
            include: [{
                model: ReadingList,
                attributes:['userId'],
                include: {
                    model: Blog,
                    as: 'readings',
                    attributes:['author','url', 'title','likes','year'],
                    through: {
                        attributes: ['read', 'id'],
                        where: {
                            read: req.query.read
                        }
                    },
                    
                },
                
            }]
        })
    } else {
        req.user = await User.findByPk(req.params.id, {
            attributes:['username', 'name'],
            include: [{
                model: ReadingList,
                attributes:['userId'],
                include: {
                    model: Blog,
                    as: 'readings',
                    attributes:['author','url', 'title','likes','year'],
                    through: {
                        attributes: ['read', 'id']
                    }
                },
                
            }]
        })
    }
    next()
}

router.get('/', async (req, res) => {
  const users = await User.findAll({
      include: {
          model: Blog
      }
  })
  res.json(users)
})

router.post('/', async (req, res) => {
    const user = await User.create(req.body)
    res.json(user)
})

router.get('/:id', userFinder, async (req, res) => {
  if (req.user) {
    res.json(req.user)
  } else {
    res.status(404).end()
  }
})

router.put('/:id', userFinder, async (req, res) => {
    if (req.user) {
        req.user[0].name = req.body.name
        await req.user[0].save()
        res.json(req.user[0])
    } else {
        res.status(404).end()
    }
})

module.exports = router