exports.splitCardholderName = (cardholderName) => {
  if (!cardholderName || typeof cardholderName !== "string") {
    throw new Error("Invalid cardholder name. It must be a non-empty string.");
  }

  // Tách tên dựa trên khoảng trắng
  const nameParts = cardholderName.trim().split(/\s+/);

  // Nếu chỉ có một phần, gán toàn bộ cho first_name
  if (nameParts.length === 1) {
    return { first_name: nameParts[0], last_name: "" };
  }

  // Gán phần đầu tiên là first_name, các phần còn lại là last_name
  const first_name = nameParts[0];
  const last_name = nameParts.slice(1).join(" ");

  return { first_name, last_name };
};

exports.parseQueryString = (queryString) => {
  if (!queryString || typeof queryString !== "string") {
    throw new Error("Invalid input: queryString must be a non-empty string.");
  }

  const pairs = queryString.split("&"); // Tách từng cặp key=value
  const result = {};

  pairs.forEach((pair) => {
    const [key, value] = pair.split("="); // Tách key và value
    result[key] = value !== undefined ? decodeURIComponent(value) : ""; // Giải mã giá trị
  });

  return result;
};
