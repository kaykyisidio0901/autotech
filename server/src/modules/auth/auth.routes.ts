import { Router } from 'express'
import * as controller from './auth.controller'
import { authMiddleware } from '../../middlewares/auth'

const router = Router()

router.post('/login', controller.login)
router.post('/register', controller.register)
router.get('/me', authMiddleware, controller.me)

export default router
