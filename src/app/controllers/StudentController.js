import * as Yup from 'yup';
import Student from '../models/Student';

class StudentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      idade: Yup.number().required(),
      peso: Yup.number().required(),
      altura: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const StudentExists = await Student.findOne({
      where: { email: req.body.email },
    });

    if (StudentExists) {
      return res
        .status(400)
        .json({ error: 'This email is already in use by another student' });
    }

    const { id, name, email, idade, peso, altura } = await Student.create(
      req.body
    );

    return res.json({
      id,
      name,
      email,
      idade,
      peso,
      altura,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      idade: Yup.number().integer(),
      peso: Yup.number(),
      altura: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { email } = req.body;

    const student = await Student.findOne({
      where: { email },
    });

    if (!student) {
      res.status(400).json({ error: 'This user does not exist' });
    }

    const { id, name, idade, peso, altura } = await student.update(req.body);

    return res.json({
      id,
      email,
      name,
      idade,
      peso,
      altura,
    });
  }
}

export default new StudentController();
