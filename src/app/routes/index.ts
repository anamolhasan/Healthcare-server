import { Router } from "express";
import { SpecialtyRoutes } from "../module/specialty/specialty.route";
import { AuthRoutes } from "../module/auth/auth.route";
import { UserRouters } from "../module/user/user.route";
import { DoctorRoutes } from "../module/doctor/doctor.route";


const router = Router()

router.use('/auth', AuthRoutes)
router.use('/specialties', SpecialtyRoutes)
router.use('/users', UserRouters)
router.use('/doctors', DoctorRoutes)




export const IndexRoutes = router