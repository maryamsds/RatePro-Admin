// components/Loader/FullScreenLoader.jsx
import { Spinner } from "react-bootstrap";

const FullScreenLoader = () => {
  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.6)",
      zIndex: 2000
    }}>
      <Spinner animation="border" variant="primary" />
    </div>
  )
}

export default FullScreenLoader;
