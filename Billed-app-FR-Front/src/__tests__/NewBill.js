import { fireEvent, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import store from "../app/Store.js"


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the newBill page should be rendered", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const newBillElement = screen.getAllByText("Envoyer une note de frais")
      expect(newBillElement).toBeTruthy()
    })
    test("Then a form with nine fields should be rendered", () => {
      document.body.innerHTML = NewBillUI()
      const form = document.querySelector("form")
      expect(form.length).toEqual(9)
    })
  })
  describe("And I upload a image file", () => {
    test("Then the file handler should show a file", () => {
      localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: 'employee@test.tld' }))
      document.body.innerHTML = NewBillUI()
      const newBill = new NewBill({ document, onNavigate: () => { return }, store: store, localStorage: window.localStorage })
      const handleChangeFile = jest.fn(() => newBill.handleChangeFile)
      const inputFile = screen.getByTestId("file")
      inputFile.addEventListener("change", handleChangeFile)
      fireEvent.change(inputFile, {
        target: {
          file: new File(["image.jpg"], "image.jpg", { type: "image/jpg" }),
          email: JSON.parse(localStorage.getItem("user")).email
        }
      })
      
      const file = screen.getByTestId("file").file
      expect(file).toBeTruthy()
    })
  })
  describe("And I upload a non-image file", () => {
    test("Then the error message should be display", async () => {
      localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: 'employee@test.tld' }))
      document.body.innerHTML = NewBillUI()
      const alert = window.alert = jest.fn()
      const newBill = new NewBill({ document, onNavigate: () => { return }, store: store, localStorage: window.localStorage })
      const handleChangeFile = jest.fn(() => newBill.handleChangeFile)
      const inputFile = screen.getByTestId("file")
      inputFile.addEventListener("change", handleChangeFile)
      fireEvent.change(inputFile, {
        target: {
          file: new File(["sample.txt"], "sample.txt", { type: "text/txt" }),
        }
      })
      expect(handleChangeFile).toBeCalled()
      expect(inputFile.file.name).toBe("sample.txt")
      expect(alert).toBeCalled()
    })
  })

  describe("And I submit a valid bill form", () => {
    test('then a bill is created', async () => {
      localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: 'employee@test.tld' }))
      document.body.innerHTML = NewBillUI()
      const newBill = new NewBill({ document, onNavigate: () => { return }, store: store, localStorage: window.localStorage })
      const form = screen.getByTestId('form-new-bill')
      const validBill = {
        name: "validBill",
        date: "2021-01-01",
        type: "Restaurants et bars",
        amount: 10,
        pct: 10,
        vat: "40",
        fileName: "test.jpg",
        fileUrl: "https://test/test.jpg"
      }
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      newBill.updateBill = (newBill) => newBill
      document.querySelector(`input[data-testid="expense-name"]`).value = validBill.name
      document.querySelector(`input[data-testid="datepicker"]`).value = validBill.date
      document.querySelector(`select[data-testid="expense-type"]`).value = validBill.type
      document.querySelector(`input[data-testid="amount"]`).value = validBill.amount
      document.querySelector(`input[data-testid="vat"]`).value = validBill.vat
      document.querySelector(`input[data-testid="pct"]`).value = validBill.pct
      document.querySelector(`textarea[data-testid="commentary"]`).value = validBill.commentary
      newBill.fileUrl = validBill.fileUrl
      newBill.fileName = validBill.fileName
      form.addEventListener('click', handleSubmit)
      fireEvent.click(form)
      expect(handleSubmit).toHaveBeenCalled()
    })
  })
})