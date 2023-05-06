import { currencyFormatter } from "../Utility";

export default function BillItem({key, name, employee, amount, Icon, iconProps}: { key: string, name: string, employee: string, amount: number, Icon: any, iconProps?: object }) {
    return (
        <li className="list-group-item bg-transparent text-light border-white ps-0" key={key}>
            <Icon {...iconProps} />  {name}<p className="small text-white-50 mb-0" style={{ marginTop: -3, marginLeft: "1.38rem" }}>{employee} - {currencyFormatter.format(amount)}</p>
        </li>
    )
}