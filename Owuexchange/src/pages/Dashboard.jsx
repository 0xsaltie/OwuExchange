import React, { useState, useEffect } from "react";
import { auth, db, storage } from "../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { signOut } from "firebase/auth";

const Dashboard = () => {
  const [threads, setThreads] = useState([]);
  const [type, setType] = useState("");
  const [color, setColor] = useState("");
  const [quantity, setQuantity] = useState("");
  const [image, setImage] = useState(null);

  useEffect(() => {
    const fetchThreads = async () => {
      const querySnapshot = await getDocs(collection(db, "threads"));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setThreads(data);
    };
    fetchThreads();
  }, []);

  const handleAddThread = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = "";
      if (image) {
        const imageRef = ref(storage, `threads/${image.name}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
      }
      await addDoc(collection(db, "threads"), {
        ownerId: auth.currentUser.uid,
        type,
        color,
        quantity,
        imageUrl,
        timestamp: new Date()
      });
      alert("Thread added!");
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div>
      <button onClick={handleLogout}>Logout</button>
      <h1>Thread Listings</h1>
      <form onSubmit={handleAddThread}>
        <input placeholder="Type" value={type} onChange={e => setType(e.target.value)} />
        <input placeholder="Color" value={color} onChange={e => setColor(e.target.value)} />
        <input placeholder="Quantity" value={quantity} onChange={e => setQuantity(e.target.value)} />
        <input type="file" onChange={e => setImage(e.target.files[0])} />
        <button type="submit">Add Thread</button>
      </form>
      <ul>
        {threads.map(thread => (
          <li key={thread.id}>
            <p>{thread.type} - {thread.color} - {thread.quantity}</p>
            {thread.imageUrl && <img src={thread.imageUrl} alt="thread" width="100" />}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
