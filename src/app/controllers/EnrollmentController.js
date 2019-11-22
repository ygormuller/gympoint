import * as Yup from 'yup';
import { parseISO, addMonths, subDays, format } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Enrollment from '../models/Enrollment';
import Plan from '../models/Plan';
import User from '../models/User';
import Student from '../models/Student';
import File from '../models/File';

class EnrollmentController {
  async index(req, res){
    const checkUser = await User.findOne({
      where: { id: req.userId, provider: true}
    });
    
    if(!checkUser){
      return res.status(401).json({ error:'User is not provide'});
    }
    
    const enrollment = await Enrollment.findAll({
      order: ['date'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email', 'age', 'height', 'weight'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title', 'duration', 'price'],
        },
      ],
    });
    
    return res.json(enrollments);
    
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { student_id, plan_id, start_date } = req.body;

   //calc price
    const studentPlan = await Plan.findByPk(plan_id);
    const { duration, price } = studentPlan;
    const totalPrice = duration * price;
    
    //calc enddate enrollment
    const parsedStartDate = parseISO(start_date);
    const parsedEndDate = subDays(addMonths(parsedStartDate, duration), 1);

    //enrollment exsits?
    const oldDate = isBefore(parseISO(start_date), new Date());
    if (oldDate) {
      return res.status(400).json({ error: 'Invalid old dates.' });
    }

    if (!student) {
      return res.status(400).json({ error: 'Student does not exist.' });
    }

    if (enrollments) {
      if (enrollments.student_id === student_id) {
        return res
          .status(400)
          .json({ error: 'Student is already registered.' });
      }
    }
      return res.json(enrollment);

    }

    async update(req, res) {
      const schemasEnrollments = Yup.object().shape({
        student_id: Yup.number().required(),
        plan_id: Yup.number().required(),
        start_date: Yup.date().required(),
      
      });
  
      if (!(await schemasEnrollments.isValid(req.body))) {
        return res
          .status(400)
          .json({ error: 'Validation fails.', message: 'Data inválida' });
      }
  
      const { enrollmentId } = req.params;
      const { student_id, plan_id, start_date } = req.body;
      const student = await Student.findByPk(student_id);
      const updatePlan = await Plan.findByPk(plan_id);
  
      const enrollments = await Enrollment.findByPk(enrollmentId);
      if (!enrollments) {
        return res.status(400).json({
          error: 'The student did not register for enrollment.',
          message: 'O Aluno ainda não esta vinculado a nenhuma matrícula',
        });
      }
  
      if (!student) {
        return res.status(400).json({
          error: 'Student does not exist.',
          message: 'O Aluno não existe',
        });
      }
  
      if (!updatePlan) {
        return res.status(400).json({
          error: 'Plan does not existing.',
          message: 'O Plano informado não existe',
        });

        return res.json(enrollment);
      }
    }

      async delete(req, res) {
        const enrollment = await Enrollment.findByPk(req.params.enrollmentId);
    
        if (!enrollment) {
          return res.status(400).json({ error: 'Invalid enrollment' });
        }
    
        await Enrollment.destroy({ where: { id: req.params.enrollmentId } });
        return res.json({ message: `Enrollment ${enrollment.id} was deleted` });
      }
    }

export default new EnrollmentController();

