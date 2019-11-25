import * as Yup from 'yup';
import {
  parseISO,
  parsedEndDate,
  isBefore,
  subDays,
  addMonths,
} from 'date-fns';

import Enrollment from '../models/Enrollment';
import Plan from '../models/Plan';
import User from '../models/User';
import Student from '../models/Student';
import File from '../models/File';

import Mail from '../../lib/Mail';

class EnrollmentController {
  async index(req, res) {
    const checkUser = await User.findOne({
      where: { id: req.userId, provider: true },
    });

    if (!checkUser) {
      return res.status(401).json({ error: 'User is not provide' });
    }

    const { page = 1 } = req.query;
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

    return res.json(enrollment);
  }

  async store(req, res) {
    const schemaEnrollments = Yup.object().shape({
      // student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schemaEnrollments.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { student_id, plan_id, start_date } = req.body;

    // calc price
    const studentPlan = await Plan.findByPk(plan_id);
    const student = await Student.findByPk(student_id);
    const { duration, price } = studentPlan;
    const totalPrice = duration * price;
    
    const enrollments = await Enrollment.findOne({
      where: {
        student_id,
      },
    });

   // if (enrollment) {
    //  return res
     //   .status(401)
    //    .json({ error: 'Student already has an enrollment' });
    //}

    // calc enddate enrollment
    const parsedStartDate = parseISO(start_date);
    const parsedEndDate = subDays(addMonths(parsedStartDate, duration), 1);

    // enrollment exsits?

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

    // Criar nova matrícula
    const enrollmentSave = await Enrollment.create({
      ...req.body,
      student_id,
      plan_id,
      price: totalPrice,
      start_date,
      end_date: parsedEndDate,
    });

    const enrollment = await Enrollment.findByPk(enrollmentSave.id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title'],
        },
      ],
    });

    await Mail.sendMail({
      to: `${enrollment.student}<${enrollment.student}>`,
      subject: 'Matrícula efetivada',
      text: 'Você está matrículado',
    });
    // enrollment = await enrollment.update(req.body);

    return res.status.json(enrollment);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number(),
      plan_id: Yup.number(),
      start_date: Yup.date(),
      end_date: Yup.date(),
      price: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }

    const { id } = req.params;

    const enrollment = await Enrollment.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email'],
        },
      ],
    });

    // enrollment = await enrollment.update(req.body);
    console.log(enrollment);
    return res.status(200).json(enrollment);
  }

  async delete(req, res) {
    const enrollment = await Enrollment.findByPk(req.params.enrollmentId);

    if (!enrollment) {
      return res.status(400).json({ error: 'Invalid enrollment' });
    }

    await Enrollment.destroy({ where: { id: req.params.enrollmentId } });
    return res.json({ message: `Enrollment ${enrollment.id} was deleted` });
  }

  async index(req, res) {
    const { student_id } = req.query;

    const enrollment = await Enrollment.findAll({
      where: { student_id },
      attributes: ['id', 'start_date', 'end_date', 'price'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'age'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['title', 'duration'],
        },
      ],
    });

    return res.json(enrollment);
  }
}


export default new EnrollmentController();
