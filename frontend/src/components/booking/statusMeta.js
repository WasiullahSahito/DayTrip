export const STATUS_META = {
  pending_payment: { label: 'Payment pending', tone: 'danger', description: 'Complete payment to confirm this booking.' },
  scheduled: { label: 'Scheduled', tone: 'info', description: 'Your booking is scheduled for later.' },
  searching: { label: 'Finding your driver', tone: 'primary', description: 'Searching for available rides...' },
  driver_assigned: { label: 'Driver assigned', tone: 'primary', description: 'A driver has been assigned to your trip.' },
  driver_en_route: { label: 'Driver on the way', tone: 'primary', description: 'Your driver is heading to your pickup point.' },
  driver_arrived: { label: 'Driver has arrived', tone: 'success', description: 'Your driver is waiting outside.' },
  in_progress: { label: 'On the way', tone: 'success', description: 'Enjoy your trip!' },
  completed: { label: 'Completed', tone: 'neutral', description: 'This trip has been completed.' },
  cancelled: { label: 'Cancelled', tone: 'danger', description: 'This booking was cancelled.' },
}
