import { format } from 'data-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';
import { async } from 'rxjs/internal/scheduler/async';

class EnrollmentMail {
    get key() {
        return 'EnrollmentMail';
    }
}

async handle({ data }) {
    const { appointment } = data;

    await Mail.sendMail({
        to: `${student.name} <${student.email}>`,
        subject: 'Matrícula realizada',
        template: 'enrollment',
        context: {
          student: student.name,
          start: format(
            parseISO(enrollment.start_date),
            "'dia' dd 'de' MMMM', às' H:mm'h'",
            {
              locale: pt,
            }
          ),
          
    
    })
}
