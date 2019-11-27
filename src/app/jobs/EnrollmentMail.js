import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class EnrollmentMail {
  get key() {
    return 'EnrollmentMail';
  }

  async handle({ data }) {
    const { enrollment, plan } = data;

    console.log('Executo');

    await Mail.senddMail({
      // to: `${student.name} <${student.email}>`,
      to: `${enrollment.student}<${enrollment.student}>`,
      subject: 'Matrícula realizada',
      template: 'enrollment',
      context: {
        student: enrollment.student,
        start: format(
          parseISO(enrollment.start_date),
          "'dia' dd 'de' MMMM', às' H:mm'h'",
          {
            locale: pt,
          }
        ),

        plan: plan.title,
        price: enrollment.price,
        end: format(
          parseISO(enrollment.end_date),
          "'dia' dd 'de' MMMM', às' H:mm'h'",
          {
            locale: pt,
          }
        ),
      },
    });
  }
}

export default new EnrollmentMail();
