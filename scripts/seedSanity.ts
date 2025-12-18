import { sanity } from '../lib/sanity'
import { PROCEDURES, DOCTORS } from '../services/mockData'

async function seed() {
  for (const procedure of PROCEDURES) {
    await sanity.createOrReplace({
      _id: procedure.id,
      _type: 'procedure',
      title: procedure.title,
      description: procedure.description,
      category: procedure.category,
      duration: procedure.duration,
      painLevel: procedure.painLevel,
      imageUrl: procedure.imageUrl,
      steps: procedure.steps,
      postCare: procedure.postCare
    })
  }

  for (const doctor of DOCTORS) {
    await sanity.createOrReplace({
      _id: doctor.id,
      _type: 'doctor',
      name: doctor.name,
      specialty: doctor.specialty,
      imageUrl: doctor.imageUrl
    })
  }

  console.log('Seeding completed!')
}

seed()
