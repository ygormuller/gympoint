import * as Yup from 'yup';
import { parseISO, isBefore, startOfHour, addMonths } from 'date-fns';

import Enrollment from '../models/Enrollment';
import Plan from '../models/Plan';
import User from '../models/User';
import Student from '../models/Student';
import File from '../models/File';

import EnrollmentMail from '../jobs/EnrollmentMail';
import Queue from '../../lib/Queue';

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
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schemaEnrollments.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { student_id, plan_id, start_date } = req.body;
    const plan = await Plan.findByPk(plan_id);
    const student = await Student.findByPk(student_id);
    const enrollments = await Enrollment.findOne({
      where: {
        student_id,
      },
    });

    if (enrollments) {
      if (enrollments.student_id === student_id) {
        return res
          .status(400)
          .json({ error: 'Student is already registered.' });
      }

    /* calc enddate enrollment
    const parsedStartDate = parseISO(start_date);
    const end_date = subDays(addMonths(parsedStartDate, duration), 1); */

    // enrollment exsits?

    /*const oldDate = isBefore(parseISO(start_date), new Date());
    if (oldDate) {
      return res.status(400).json({ error: 'Invalid old dates.' });
    }
    console.log(student_id);*/
    if (!student) {
      return res.status(400).json({ error: 'Student does not exist.' });
    }

    if (!plan) {
      return res.status(401).json({ error: 'The plan was not found.' });
    }

    const startDate = startOfHour(parseISO(start_date));

    if (isBefore(startDate, new Date())) {
      return res.status(400).json({ error: 'Past date are not permitted' });
    }

    const { price, duration } = plan;
    const priceTotal = price * duration;
    const endDate = addMonths(startDate, duration);

    const enrollment = await Enrollment.create({
      student_id,
      plan_id,
      start_date,
      end_date: endDate,
      price: priceTotal,
    });
 
    await Queue.add(EnrollmentMail.key, {
      enrollment,
      dtudent,
      plan,
    });
    // to: `${enrollment.student}<${enrollment.student}>`,
    // subject: 'Matrícula efetivada',
    // text: 'Você está matrículado',
    // });
    // enrollment = await enrollment.update(req.body);*/

    return res.json(enrollment);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number(),
      plan_id: Yup.number(),
      start_date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }

    const { start_date, plan_id, student_id } = req.body;

    // Check if the student exists at enrollment

    const studentEnrollment = await Enrollment.findOne({
      where: { student_id },
    });

    if (!studentEnrollment) {
      return res
        .status(401)
        .json({ error: 'The student does not have enrollment' });
    }

    // Check Student exists

    const student = await Student.findByPk(student_id);

    if (!student) {
      return res.status(401).json({ error: 'The Student was not found' });
    }

    const plan = await Plan.findByPk(plan_id);

    // if (!plan) {
    //   return res.status(401).json({ error: 'The plan was not found.' });
    // }

    // Check for past date

    const startDate = startOfHour(parseISO(start_date));

    if (isBefore(startDate, new Date())) {
      return res.status(400).json({ error: 'Past date are not permitted' });
    }

    const { price, duration } = plan;
    const priceTotal = price * duration;
    const endDate = addMonths(startDate, duration);

    const enrollment = await studentEnrollment.update({
      student_id,
      plan_id,
      start_date,
      end_date: endDate,
      price: priceTotal,
    });

    return res.json(enrollment);
  }

  async delete(req, res) {
    const { student_id } = req.body;
    const studentEnrollment = await Enrollment.findOne({
      where: { student_id },
    });

    if (!studentEnrollment) {
      return res
        .status(401)
        .json({ error: 'The student does not have enrollment' });
    }

    Enrollment.destroy({
      where: { student_id },
    });

    return res.json(studentEnrollment);
  }
}

export default new EnrollmentController();
