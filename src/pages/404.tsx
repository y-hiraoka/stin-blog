const Custom404: React.VFC = () => {
  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "10rem",
          fontSize: "2rem",
        }}>
        <p>404 Not Found</p>
        <p style={{ marginTop: "2rem" }}>すまん</p>
      </div>
    </>
  );
};

export default Custom404;
