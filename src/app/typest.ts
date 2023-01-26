export type DataSource = {
    dateCreated: string;
    customDescription: string;
    amount: string
}

export type User = { name: string; email: string; id: string }
export type MovementsSource = { data: {data: DataSource[]} }