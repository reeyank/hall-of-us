export async function POST(request) {
  const formData = await request.formData();

  const response = await fetch('https://api.doubleehbatteries.com/photos/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  return new Response(JSON.stringify(data), {
    status: response.status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
