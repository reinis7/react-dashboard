const PriorityColor = (status: string) => {
  let statusColor = '';
  if (status?.toLowerCase() === 'high') {
    statusColor = 'bg-[#61A0FF]';
  } else if (status?.toLowerCase() === 'medium') {
    statusColor = 'bg-[#FFAA2C]';
  } else {
    statusColor = 'bg-[#FFD361]';
  }

  return statusColor;
};

export default PriorityColor;
