export default {
    name: 'procedure',
    title: 'Procedure',
    type: 'document',
    fields: [
      { name: 'title', title: 'Title', type: 'string' },
      { name: 'description', title: 'Description', type: 'text' },
      { name: 'category', title: 'Category', type: 'string' },
      { name: 'duration', title: 'Duration', type: 'string' },
      { name: 'painLevel', title: 'Pain Level', type: 'string' },
      { name: 'imageUrl', title: 'Image', type: 'image' },
      { name: 'steps', title: 'Steps', type: 'array', of: [{ type: 'string' }] },
      { name: 'postCare', title: 'Post Care', type: 'array', of: [{ type: 'string' }] },
    ],
  }
  