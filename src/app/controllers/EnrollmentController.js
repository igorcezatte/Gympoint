import * as Yup from 'yup';
import { addMonths, parseISO } from 'date-fns';

import Enrollment from '../models/Enrollment';
import Plan from '../models/Plan';
import Student from '../models/Student';
import Mail from '../../lib/Mail';

class EnrollmentController {
  async index(req, res) {
    const enrollments = await Enrollment.findAll({
      attributes: [
        'id',
        'student_id',
        'plan_id',
        'start_date',
        'end_date',
        'price',
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
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { student_id, plan_id, start_date } = req.body;

    const enrollmentE = await Enrollment.findOne({
      where: { student_id },
    });

    const today = new Date();

    if (enrollmentE) {
      if (enrollmentE.end_date > today) {
        return res
          .status(401)
          .json({ error: 'This student is already enrolled at Gympoint' });
      }
    }

    const student = await Student.findOne({
      where: { id: student_id },
    });

    const plan = await Plan.findOne({
      where: { id: plan_id },
    });

    if (!student) {
      return res.status(400).json({ error: 'Student ID not exist' });
    }

    if (!plan) {
      return res.status(400).json({ error: 'Plan not exist' });
    }

    const price = plan.duration * plan.price;

    Enrollment.price = price;

    const end_date = addMonths(parseISO(start_date), plan.duration);

    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'New plan contracted',
      template: 'enrollments',
      context: {
        student: student.name,
        date: start_date,
      },
    });

    const enrollment = await Enrollment.create({
      student_id,
      plan_id,
      start_date,
      price,
      end_date,
    });

    return res.json({ enrollment });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      enrollment_id: Yup.number().required(),
      start_date: Yup.date().required(),
      plan_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { enrollment_id, start_date, plan_id } = req.body;

    const enrollment = await Enrollment.findOne({
      where: { id: enrollment_id },
    });

    if (!enrollment) {
      return res.status(400).json({ error: 'Have no enrollment with this ID' });
    }

    const plan = await Plan.findOne({
      where: { id: plan_id },
    });

    const price = plan.duration * plan.price;

    const end_date = addMonths(parseISO(start_date), plan.duration);

    await enrollment.update({ price, start_date, end_date, plan_id });

    return res.json({
      enrollment_id,
      start_date,
      plan_id,
      price,
      end_date,
    });
  }

  async delete(req, res) {
    const { id } = req.params;

    await Enrollment.destroy({ where: { id } });

    return res.json({ message: 'Enrollment deleted' });
  }
}

export default new EnrollmentController();
