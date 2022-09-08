const {
  calculateTip,
  fahrenheitToCelsius,
  celsiusToFahrenheit,
  add,
} = require("../src/math.js");

////////////////
////////////////
test("Should calculate total with tip", () => {
  const total = calculateTip(10, 0.3);
  expect(total).toBe(13);
});

test("Should calculate total with default tip", () => {
  const total = calculateTip(10);
  expect(total).toBe(12.5);
});

test("should convert 32 F to 0 C", () => {
  const toCelsius = fahrenheitToCelsius(32);
  expect(toCelsius).toBe(0);
});

test("should convert 0 C to 32 F", () => {
  const toFahrenheit = celsiusToFahrenheit(0);
  expect(toFahrenheit).toBe(32);
});

//// Testing Asynchronous code using jest
// test("Async test demo", (done) => {
//   setTimeout(() => {
//     expect(1).toBe(2);
//     done();
//   }, 2000);
// });

test("Should add two number", (done) => {
  add(2, 3).then((sum) => {
    expect(sum).toBe(5);
    done();
  });
});

test("should add two numbers async/await", async () => {
  const sum = await add(10, 22);
  expect(sum).toBe(32);
});
