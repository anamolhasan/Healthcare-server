import { Router } from "express";
import { UserController } from "./user.controller";


const router = Router()

router.post('/create-doctor', UserController.createDoctor)
// router.post('/create-admin', UserController.createDoctor)
// router.post('/create-supper-admin', UserController.createDoctor)


export const UserRouters = router