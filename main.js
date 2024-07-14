const express = require('express');
const cors = require('cors');
const app = express();

const allowedOrigins = ['*-0255c62a-4048-11ef-ad89-8ab10d9d05b0.myjsblock.app'];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

app.use(cors(corsOptions));

// Your other middleware and route handlers

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

let fps = document.getElementById('fps').value;
let locationEnabled = document.getElementById('locationToggle').checked;
let notesData = JSON.parse(localStorage.getItem('notesData')) || [];

function toggleDetails() {
  const details = document.getElementById('mixerDetails');
  if (details.style.display === 'none' || details.style.display === '') {
    details.style.display = 'block';
  } else {
    details.style.display = 'none';
  }
}

function saveMixerDetails() {
  const mixerName = document.getElementById('mixerName').value;
  const mixerEmail = document.getElementById('mixerEmail').value;
  const mixerPhone = document.getElementById('mixerPhone').value;
  const sampleRate = document.getElementById('sampleRate').value;
  const bitDepth = document.getElementById('bitDepth').value;
  const micsUsed = document.getElementById('micsUsed').value;

  localStorage.setItem('mixerName', mixerName);
  localStorage.setItem('mixerEmail', mixerEmail);
  localStorage.setItem('mixerPhone', mixerPhone);
  localStorage.setItem('sampleRate', sampleRate);
  localStorage.setItem('bitDepth', bitDepth);
  localStorage.setItem('micsUsed', micsUsed);

  showSuccessMessage('saveSuccess');
}

function saveProjectName() {
  const projectName = document.getElementById('projectName').value.trim();
  localStorage.setItem('projectName', projectName);
  localStorage.setItem('projectCreationDate', new Date().toLocaleString());
  showSuccessMessage('projectSaveSuccess');
}

function showSuccessMessage(elementId) {
  const element = document.getElementById(elementId);
  element.style.display = 'block';
  setTimeout(() => {
    element.style.display = 'none';
  }, 3000);
}

function updateDeviceTime() {
  setInterval(() => {
    const now = new Date();
    fps = parseFloat(document.getElementById('fps').value);
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const frames = Math.floor((now.getMilliseconds() / 1000) * fps)
      .toString()
      .padStart(2, '0');
    document.getElementById(
      'deviceTime'
    ).textContent = `${hours}:${minutes}:${seconds}:${frames}`;
  }, 1000 / fps);
}

function addTimestamp() {
  const timestamp = document.getElementById('deviceTime').textContent;
  const container = document.getElementById('notesContainer');
  container.style.display = 'block';
  let locationInfo = 'Location data disabled';
  if (locationEnabled) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        locationInfo = `${position.coords.latitude},${position.coords.longitude}`;
        container.innerHTML = `<div><label>Timestamp: ${timestamp}</label><textarea rows="4" cols="50" placeholder="Enter notes here..."></textarea><label>${locationInfo}</label><button onclick="saveNote('${timestamp}', '${locationInfo}')">Save Note</button></div>`;
      });
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  } else {
    container.innerHTML = `<div><label>Timestamp: ${timestamp}</label><textarea rows="4" cols="50" placeholder="Enter notes here..."></textarea><label>${locationInfo}</label><button onclick="saveNote('${timestamp}', '${locationInfo}')">Save Note</button></div>`;
  }
}

function saveNote(timestamp, location) {
  const textareas = document.querySelectorAll('#notesContainer textarea');
  const note = textareas[textareas.length - 1].value;
  const newNote = { timestamp, note, location };
  notesData.push(newNote);
  localStorage.setItem('notesData', JSON.stringify(notesData));
  addNoteToTable(newNote);
  hideNotesContainer();
}

function hideNotesContainer() {
  const container = document.getElementById('notesContainer');
  container.innerHTML = '';
  container.style.display = 'none';
}

function addNoteToTable(noteObj) {
  const table = document.getElementById('notesTable');
  const row = table.insertRow(-1);
  const timestampCell = row.insertCell(0);
  const notesCell = row.insertCell(1);
  const locationCell = row.insertCell(2);
  const actionCell = row.insertCell(3);
  timestampCell.textContent = noteObj.timestamp;
  notesCell.textContent = noteObj.note;
  locationCell.textContent = noteObj.location;
  actionCell.innerHTML = `<button onclick="editNote(this.parentNode.parentNode)">Edit</button> <button onclick="deleteNote(this.parentNode.parentNode)">Delete</button>`;
}

function editNote(row) {
  const timestamp = row.cells[0].textContent;
  const oldNote = row.cells[1].textContent;
  const oldLocation = row.cells[2].textContent;
  row.cells[1].innerHTML = `<textarea rows="4" cols="50">${oldNote}</textarea>`;
  row.cells[2].textContent = oldLocation;
  row.cells[3].innerHTML = `<button onclick="saveEditedNote(this.parentNode.parentNode, '${timestamp}', '${oldLocation}')">Save</button>`;
}

function saveEditedNote(row, timestamp, location) {
  const textarea = row.cells[1].querySelector('textarea');
  const newNote = textarea.value;
  updateNoteInData(timestamp, newNote, location);
  row.cells[1].textContent = newNote;
  row.cells[2].textContent = location;
  row.cells[3].innerHTML = `<button onclick="editNote(this.parentNode.parentNode)">Edit</button> <button onclick="deleteNote(this.parentNode.parentNode)">Delete</button>`;
}

function updateNoteInData(timestamp, note, location) {
  const index = notesData.findIndex(
    (n) => n.timestamp === timestamp && n.location === location
  );
  if (index !== -1) {
    notesData[index].note = note;
    localStorage.setItem('notesData', JSON.stringify(notesData));
  }
}

function deleteNote(row) {
  const timestamp = row.cells[0].textContent;
  const location = row.cells[2].textContent;
  if (confirm('Are you sure you want to delete this note?')) {
    const index = notesData.findIndex(
      (n) => n.timestamp === timestamp && n.location === location
    );
    if (index !== -1) {
      notesData.splice(index, 1);
      localStorage.setItem('notesData', JSON.stringify(notesData));
      row.parentNode.removeChild(row);
    }
  }
}

function clearAll() {
  if (
    confirm(
      'Are you sure you want to clear all notes? This action cannot be undone.'
    )
  ) {
    localStorage.removeItem('notesData');
    document.getElementById('notesTable').innerHTML =
      '<tr><th>Timestamp</th><th>Notes</th><th>Location</th><th>Actions</th></tr>';
    document.getElementById('notesContainer').innerHTML = '';
    document.getElementById('projectName').value = 'Default';
    notesData = [];
  }
}

function exportTableToCSV() {
  var projectName =
    document.getElementById('projectName').value.trim() || 'Default';
  var dateStamp = new Date().toLocaleDateString().replace(/\//g, '-');
  var timeStamp = new Date().toLocaleTimeString().replace(/:/g, '-');
  var filename = `${projectName}-${dateStamp}-${timeStamp}.csv`;
  var csv = [];
  var rows = document.querySelectorAll('#notesTable tr');
  csv.push(`"Project Name","${projectName}"`);
  csv.push(`"Creation Date","${localStorage.getItem('projectCreationDate')}"`);
  csv.push(`"Mixer Name","${localStorage.getItem('mixerName') || ''}"`);
  csv.push(`"Mixer Email","${localStorage.getItem('mixerEmail') || ''}"`);
  csv.push(`"Mixer Phone","${localStorage.getItem('mixerPhone') || ''}"`);
  csv.push(`"Sample Rate","${localStorage.getItem('sampleRate') || ''}"`);
  csv.push(`"Bit Depth","${localStorage.getItem('bitDepth') || ''}"`);
  csv.push(`"Mics Used","${localStorage.getItem('micsUsed') || ''}"`);
  csv.push('');
  csv.push('Timestamp,Notes,Location');
  for (var i = 1; i < rows.length; i++) {
    var cols = rows[i].querySelectorAll('td:not(:last-child)');
    var rowArray = Array.from(cols).map(
      (col) => `"${col.innerText.replace(/"/g, '""')}"`
    );
    csv.push(rowArray.join(','));
  }
  downloadCSV(csv.join('\n'), filename);
}

function downloadCSV(csv, filename) {
  var csvFile;
  var downloadLink;
  csvFile = new Blob([csv], { type: 'text/csv' });
  downloadLink = document.createElement('a');
  downloadLink.download = filename;
  downloadLink.href = window.URL.createObjectURL(csvFile);
  downloadLink.style.display = 'none';
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

function toggleLocation() {
  locationEnabled = document.getElementById('locationToggle').checked;
}

function loadNotes() {
  if (notesData.length > 0) {
    notesData.forEach((note) => addNoteToTable(note));
  }
}

updateDeviceTime(); // Start updating the time immediately
loadNotes(); // Load notes from local storage when the page loads
