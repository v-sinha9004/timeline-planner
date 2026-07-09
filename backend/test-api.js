async function test() {
  console.log("--- Testing API ---");
  const baseUrl = 'http://localhost:5002/api/tasks';

  // 1. Create a task
  console.log("1. Creating task...");
  const newTask = {
    title: "Test Task " + Date.now(),
    priority: "MEDIUM",
    status: "PENDING",
    isTest: false,
    tags: []
  };
  
  const createRes = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newTask)
  });
  
  const createData = await createRes.json();
  console.log("Create status:", createRes.status);
  console.log("Create response:", createData);

  if (createRes.status !== 201) {
    console.error("Failed to create task");
    return;
  }

  const taskId = createData.id;

  // 2. Get the task
  console.log("\n2. Getting task...");
  const getRes = await fetch(`${baseUrl}/${taskId}`);
  const getData = await getRes.json();
  console.log("Get status:", getRes.status);
  console.log("Get response title:", getData.title);

  // 3. Update the task
  console.log("\n3. Updating task...");
  const updateRes = await fetch(`${baseUrl}/${taskId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: "COMPLETED", completedDates: ["2026-07-09"] })
  });
  const updateData = await updateRes.json();
  console.log("Update status:", updateRes.status);
  console.log("Update response status:", updateData.status, "completedDates:", updateData.completedDates);

  // 4. Delete the task
  console.log("\n4. Deleting task...");
  const deleteRes = await fetch(`${baseUrl}/${taskId}`, {
    method: 'DELETE'
  });
  const deleteData = await deleteRes.json();
  console.log("Delete status:", deleteRes.status);
  console.log("Delete response:", deleteData);
}

test().catch(console.error);
