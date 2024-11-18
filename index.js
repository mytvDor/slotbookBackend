const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors')
const app = express();
const port = 7000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors())

mongoose.connect("mongodb+srv://sumitdhonde0:OP3ZFh4RtwEm1RdJ@cluster100.recamce.mongodb.net/?retryWrites=true&w=majority&appName=Cluster100/appointments");

const appointmentSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
});

const Appointment = mongoose.model('Appointment', appointmentSchema);


app.post('/appointments', (req, res) => {
  const { date, startTime, endTime, name, email, phone } = req.body;
  const newAppointment = new Appointment({
    date,
    startTime,
    endTime,
    name,
    email,
    phone,
  });
  newAppointment.save()
    .then(appointment => res.json(appointment))
    .catch(err => res.status(400).json({ error: err.message }));
});

app.get('/appointments', (req, res) => {
  Appointment.find()
    .then(appointments => res.json(appointments))
    .catch(err => res.status(400).json({ error: err.message }));
});

app.get('/appointments/:id', (req, res) => {
  Appointment.findById(req.params.id)
    .then(appointment => {
      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
      res.json(appointment);
    })
    .catch(err => res.status(400).json({ error: err.message }));
});

app.put('/appointments/:id', (req, res) => {
  Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(appointment => {
      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
      res.json(appointment);
    })
    .catch(err => res.status(400).json({ error: err.message }));
});

app.delete('/appointments/:id', (req, res) => {
  Appointment.findByIdAndDelete(req.params.id)
    .then(appointment => {
      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
      res.json({ message: 'Appointment deleted successfully' });
    })
    .catch(err => res.status(400).json({ error: err.message }));
});




app.get('/appointments/date/:date', (req, res) => {
  const requestedDate = req.params.date;
  Appointment.find({ date: { $gte: new Date(requestedDate), $lt: new Date(requestedDate + 'T23:59:59.999Z') } })
    .sort({ startTime: 1 }) // Sort by startTime ascending order
    .then(appointments => {
      if (appointments.length === 0) {
        return res.json([]);
      }
      
      const amAppointments = appointments.filter(appt => {
        const period = appt.startTime.split(' ')[1];
        return period === 'AM';
      });
      
      const pmAppointments = appointments.filter(appt => {
        const period = appt.startTime.split(' ')[1];
        return period === 'PM';
      });
      
      const sortedAppointments = [...amAppointments, ...pmAppointments];
      
      res.json(sortedAppointments);
    })
    .catch(err => res.status(400).json({ error: err.message }));
});



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
