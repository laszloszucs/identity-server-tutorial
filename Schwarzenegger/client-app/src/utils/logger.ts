function log(input: any, color = "#41b883", textColor = "white") {
  console.log(input,
    `background:#35495e ; padding: 1px; border-radius: 3px 0 0 3px;  color: ${textColor}`,
    `background:${color} ; padding: 1px; border-radius: 0 3px 3px 0;  color: ${textColor}`,
    "background:transparent"
  );
}

export default { log };
