import './Dashboard.css';

import * as React from 'react';

type DashboardProps = {
  greeting: string;
};

export const Dashboard: React.FunctionComponent<DashboardProps> = (props: DashboardProps) => {
  const { greeting } = props;

  return <div>{greeting}</div>;
};
