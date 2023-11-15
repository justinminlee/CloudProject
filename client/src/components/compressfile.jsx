import React, { useState } from 'react';
import axios from 'axios';

function Compresssfile() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [compressionFormat, setCompressionFormat] = useState('zip');
  const [downloadLink, setDownloadLink] = useState(null);

  const handleFileChange = (e) => {
    const files = e.target.files;
    setSelectedFiles([...files]);
  };

  const handleCompressionFormatChange = (e) => {
    setCompressionFormat(e.target.value);
  };

  const handleCompression = async () => {
    console.log('Compress button clicked');
    if (selectedFiles.length === 0) {
      console.error('No files selected for compression');
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      const filename = file.webkitRelativePath || file.name;
      formData.append('files', file, filename);
    });

    try {
      const response = await axios.post('http://localhost:3000/compress', formData, {
        responseType: 'blob',
      });

      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      setDownloadLink(downloadUrl);

    } catch (error) {
      console.error('Error during compression:', error);
    }
  };

  const handleDownload = () => {
    console.log('Download button clicked');
    if (downloadLink) {
      const link = document.createElement('a');
      link.href = downloadLink;

      document.body.appendChild(link);
      link.click();
      link.remove();

      // Clean up
      (window.URL || window.webkitURL).revokeObjectURL(downloadLink);
      setDownloadLink(null);
    }
  };

  return (
    <div className="App">
      <h1>File Compression App</h1>
      <input type="file" multiple onChange={handleFileChange} />
      <label>
        Compression Format:
        <select value={compressionFormat} onChange={handleCompressionFormatChange}>
          <option value="zip">ZIP</option>
          <option value="tar.gz">Tar Gzip</option>
        </select>
      </label>
      <button onClick={handleCompression}>Compress</button>
      {downloadLink && <button onClick={handleDownload}>Download Compressed File</button>}
    </div>
  );
}

export default Compresssfile;
