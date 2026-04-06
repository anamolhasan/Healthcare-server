import { Router } from "express";
import { SpecialtyRoutes } from "../module/specialty/specialty.route";
import { AuthRoutes } from "../module/auth/auth.route";
import { UserRouters } from "../module/user/user.route";
import { DoctorRoutes } from "../module/doctor/doctor.route";
import { AdminRoutes } from "../module/admin/admin.route";
import { scheduleRoutes } from "../module/schedule/schedule.route";
import { DoctorScheduleRoutes } from "../module/doctorSchedule/doctorSchedule.route";
import { AppointmentRouter } from "../module/appointment/appointment.route";
import { PatientRoutes } from "../module/patient/patient.route";
import { ReviewRoutes } from "../module/review/review.route";
import { PrescriptionRoutes } from "../module/prescription/prescription.route";


const router = Router()

router.use('/auth', AuthRoutes)
router.use('/specialties', SpecialtyRoutes)
router.use('/users', UserRouters)
router.use('/patients', PatientRoutes)
router.use('/doctors', DoctorRoutes)
router.use('/admins', AdminRoutes)
router.use('/schedules', scheduleRoutes)
router.use('/doctor-schedules', DoctorScheduleRoutes)
router.use('/appointments', AppointmentRouter)
router.use('/prescriptions', PrescriptionRoutes)
router.use('/reviews', ReviewRoutes)


export const IndexRoutes = router