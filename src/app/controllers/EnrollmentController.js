import * as Yup from 'yup';
import { parseISO, addMonths, format } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Enrollment from '../models/Enrollment';
import Plan from '../models/Plan';
import Student from '../models/Student';
import File from '../models/File';

class EnrollmentController {
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

    // Calculate the Total Price
    const studentPlan = await Plan.findByPk(plan_id);
    const { duration, price } = studentPlan;
    const totalPrice = duration * price;

    // Calculate the End Date of the Enrollment.
    // I subtracted one day at the end so it's possible to renroll ate the same day
    const parsedStartDate = parseISO(start_date);
    const parsedEndDate = subDays(addMonths(parsedStartDate, duration), 1);

    return res.json();
  }
}

export default new EnrollmentController();
