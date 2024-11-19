import React, { useContext, useState } from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Inventory } from './types';
import { MenuItem, Stack, TextField } from '@mui/material';
import { CheckOutlined, EditOutlined } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import AuthContext from '../../auth/AuthContext';
import dayjs from 'dayjs';
import { updateProductInventory } from './apis';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FETCH_INVENTORY_QUERY_KEY } from './constants';

function Row(props: { row: Inventory }) {
  const queryClient = useQueryClient();
  const { suppliers } = useContext(AuthContext);
  const { row } = props;
  const [open, setOpen] = useState(false);
  const [editable, setEditable] = useState(false);
  const [formValues, setFormValues] = useState<Inventory>({ ...row });

  const { mutateAsync: mutateUpdate, isLoading: isLoading } = useMutation({
    mutationFn: updateProductInventory,
    onSuccess: () => {
      setEditable(false);
      queryClient.invalidateQueries([FETCH_INVENTORY_QUERY_KEY]);
    },
    // eslint-disable-next-line
    onError: (err: any) => {
      console.error(err);
    },
  });

  const handleSave = async () => {
    await mutateUpdate(formValues);
  };

  return (
    <React.Fragment>
      <TableRow sx={{ cursor: 'pointer' }} onClick={() => setOpen(!open)}>
        <TableCell component="th" scope="row">
          {`${new Date(row.stock_arrival_date || '').toLocaleDateString('en-US')}`}
        </TableCell>
        <TableCell align="right">{row.quantity_on_order}</TableCell>
        <TableCell align="right">
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
            sx={{ border: 0 }}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Stack
                direction={'row'}
                justifyContent="space-between"
                alignItems={'center'}
              >
                <Typography
                  variant="body2"
                  gutterBottom
                  component="div"
                  fontWeight={600}
                >
                  Details
                </Typography>
                <IconButton
                  aria-label="expand row"
                  size="small"
                  onClick={() =>
                    editable ? handleSave() : setEditable(!editable)
                  }
                  disabled={isLoading}
                >
                  {editable ? <CheckOutlined /> : <EditOutlined />}
                </IconButton>
              </Stack>
              <Table size="small" aria-label="purchases">
                <TableBody>
                  <TableRow>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{ fontWeight: '500' }}
                    >
                      Quantity on Hand
                    </TableCell>
                    <TableCell>
                      {editable ? (
                        <TextField
                          fullWidth
                          type="number"
                          value={formValues.quantity_on_hand}
                          onChange={(e) =>
                            setFormValues((v) => ({
                              ...v,
                              quantity_on_hand: e.target
                                .value as unknown as number,
                            }))
                          }
                        />
                      ) : (
                        row.quantity_on_hand
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{ fontWeight: '500' }}
                    >
                      Expiry Date
                    </TableCell>
                    <TableCell>
                      {editable ? (
                        <DatePicker
                          value={dayjs(formValues.expiry_date)}
                          onChange={(value) =>
                            setFormValues((v) => ({
                              ...v,
                              // eslint-disable-next-line
                              expiry_date: (value as any)?.format('MM-DD-YYYY'),
                            }))
                          }
                          sx={{
                            '.MuiIconButton-root': {
                              border: 0,
                              width: '38px',
                              height: '38px',
                            },
                          }}
                        />
                      ) : (
                        `${new Date(row.expiry_date || '').toLocaleDateString('en-US')}`
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{ fontWeight: '500' }}
                    >
                      Supplier
                    </TableCell>
                    <TableCell>
                      {editable ? (
                        <TextField
                          select
                          fullWidth
                          // eslint-disable-next-line
                          value={(formValues.supplier_id as any)?._id}
                          onChange={(e) =>
                            setFormValues((v) => ({
                              ...v,
                              supplier_id: e.target.value,
                            }))
                          }
                        >
                          {suppliers.map((s) => (
                            <MenuItem key={s._id} value={s._id}>
                              {s.supplier_name}
                            </MenuItem>
                          ))}
                        </TextField>
                      ) : (
                        // eslint-disable-next-line
                        (row.supplier_id as any)?.supplier_name
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{ fontWeight: '500' }}
                    >
                      Status
                    </TableCell>
                    <TableCell>
                      {editable ? (
                        <TextField
                          select
                          fullWidth
                          value={formValues.status}
                          onChange={(e) =>
                            setFormValues((v) => ({
                              ...v,
                              status: e.target.value,
                            }))
                          }
                        >
                          <MenuItem value={'active'}>ACTIVE</MenuItem>
                          <MenuItem value={'out_of_stock'}>
                            OUT OF STOCK
                          </MenuItem>
                          <MenuItem value={'discontinued'}>
                            DISCONTINUED
                          </MenuItem>
                        </TextField>
                      ) : (
                        row.status?.toUpperCase()
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

interface IProps {
  data: Inventory[];
}

export default function CollapsibleTable({ data }: IProps) {
  if (data.length === 0) return <></>;
  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell>Arrival Date</TableCell>
            <TableCell align="right">Quantity on Order</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <Row key={row.stock_arrival_date} row={row} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
