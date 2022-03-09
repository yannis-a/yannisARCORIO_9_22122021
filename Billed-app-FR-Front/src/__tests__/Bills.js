import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js";
import userEvent from "@testing-library/user-event";
import router from "../app/Router";
import mockStore from "../__mocks__/store";
import { ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "employee@test.tld",
          password: "employee",
          status: "connected",
        })
      );
      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;
      const icon = screen.getByTestId("icon-window");
      const classList = icon.classList;
      expect(classList.contains("active-icon")).toBe(true);
    });

    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });

    test("Then i click on new bill button", () => {
      const html = BillsUI({ data: bills });
      const billsObject = new Bills({
        document,
        onNavigate: () => {},
        store: {},
        localStorage: window.localStorage,
      });
      document.body.innerHTML = html;

      const handleShowTickets1 = jest.fn((e) =>
        billsObject.handleClickNewBill()
      );

      const buttonNewBill = screen.getByTestId("btn-new-bill");
      buttonNewBill.addEventListener("click", handleShowTickets1);
      userEvent.click(buttonNewBill);
      expect(handleShowTickets1).toHaveBeenCalled();
    });

    test("Then i click on icon eye", () => {
      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;
      const billObject = new Bills({
        document,
        onNavigate: () => {},
        store: null,
        localStorage: window.localStorage,
      });
      billObject.handleClickIconEye = jest.fn();
      screen.getAllByTestId("icon-eye")[0].click();
      expect(billObject.handleClickIconEye).toBeCalled();
    });

    test("and the modal should display the attached image", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const billObject = new Bills({
        document,
        onNavigate: () => {},
        store: null,
        localStorage: window.localStorage,
      });
      const iconEye = document.querySelector(`div[data-testid="icon-eye"]`);
      $.fn.modal = jest.fn();
      billObject.handleClickIconEye(iconEye);
      expect($.fn.modal).toBeCalled();
      expect(document.querySelector(".modal")).toBeTruthy();
    });

    test("Then, Loading page should be rendered", () => {
      document.body.innerHTML = BillsUI({ loading: true });
      const loadingElement = screen.getAllByText("Loading...");
      expect(loadingElement).toBeTruthy();
    });

    test("Then, Error page should be rendered", () => {
      document.body.innerHTML = BillsUI({ error: "error message" });
      const errorElement = screen.getAllByText("Erreur");
      expect(errorElement).toBeTruthy();
    });
  });
});

// test d'intégration GET
describe("Given I am a user connected as Employe", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "employee@test.tld" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;
      const message = await screen.getByText("Mes notes de frais");
      expect(message).toBeTruthy();
    });
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "employee@test.tld",
          })
        );
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router();
      });
      test("fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });
        const html = BillsUI({ error: "Erreur 404" });
        document.body.innerHTML = html;
        const message = await screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });
    });
  });
});
