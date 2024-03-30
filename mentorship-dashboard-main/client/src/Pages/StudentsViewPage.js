import { useState, useEffect } from "react";
import { Container, Table, ButtonGroup, Button } from "react-bootstrap";
import NavigationBar from "../Components/NavigationBar";
import { getAssignedStudents, unassignStudent } from "../utils/api";
import { useNavigate } from "react-router-dom";
import '../index.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const generatePDF = () => {
  window.print();
};


const StudentsViewPage = () => {
  // Get the mentor value from localStorage
  let mentor = localStorage.getItem("mentor");
  if (mentor) mentor = JSON.parse(mentor);

  const navigate = useNavigate();

  // Set up state for the list of assigned students and the filtered list of students
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);

  // Set up state for the evaluated filter, which determines whether to show all students or only evaluated or pending ones
  const [evaluatedFilter, setEvaluatedFilter] = useState("all");

  // Function to fetch the list of assigned students from the server
  const fetchStudents = async () => {
    const data = await getAssignedStudents(mentor.id);
    await setStudents(data);
    await setFilteredStudents(data);
  };

  // Function to filter the list of students based on the evaluated filter
  const filterStudents = (filter) => {
    switch (filter) {
      case "pending":
        setFilteredStudents(
          students.filter(
            (student) =>
              student.evaluated_by === null &&
              (student.ideation !== null ||
                student.execution !== null ||
                student.viva !== null)
          )
        );
        break;
      case "evaluated":
        setFilteredStudents(
          students.filter(
            (student) =>
              student.evaluated_by !== null &&
              student.ideation !== null &&
              student.execution !== null &&
              student.viva !== null
            )
        );
        break;
      default:
        setFilteredStudents(students);
        break;
    }
  };

  // Function to handle unassigning a student from the mentor
  const handleUnassign = async (studentId) => {
    await unassignStudent(mentor.id, studentId);
    await fetchStudents();
  };

  // Function to navigate to the student evaluation page
  const evaluateStudent = (studentId) => {
    navigate(`/student-evaluate/${studentId}`);
  };

  // Use the fetchStudents function to populate the students and filteredStudents state arrays
  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line
  }, []);
  return (
    <>
      <NavigationBar />
      <Container fluid className="mt-3">
        <ButtonGroup className="mb-3 gap-2">
          <Button
            variant="outline-primary"
            className={evaluatedFilter === "all" ? "active" : ""}
            onClick={() => {
              setEvaluatedFilter("all");
              setFilteredStudents(students);
            }}
          >
            All
          </Button>
          <Button
            variant="outline-primary"
            className={evaluatedFilter === "pending" ? "active" : ""}
            onClick={() => {
              setEvaluatedFilter("pending");
              filterStudents("pending");
            }}
          >
            Pending
          </Button>
          <Button
            variant="outline-primary"
            className={evaluatedFilter === "evaluated" ? "active" : ""}
            onClick={() => {
              setEvaluatedFilter("evaluated");
              filterStudents("evaluated");
            }}
          >
            Evaluated
          </Button>
          <Button
            variant="outline-primary"
            onClick={() => {
              generatePDF();
            }}
          >
            Generate PDF
          </Button>
        </ButtonGroup>
        <Table id="marksTable" striped bordered hover className="align-middle text-center">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Idea Marks</th>
              <th>Execution Marks</th>
              <th>Viva Marks</th>

              <th>Evaluate</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
          {Array.isArray(filteredStudents) && filteredStudents.map((student) => (
           <tr key={student.id}>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>{student.ideation ?? "-"}</td>
                <td>{student.execution ?? "-"}</td>
                <td>{student.viva ?? "-"}</td>
                <td>
                  {student.evaluated_by === null ? (
                    <Button
                      variant="primary"
                      onClick={() => evaluateStudent(student.id)}
                    >
                      Edit
                    </Button>
                  ) : (
                    <span>Evaluated</span>
                  )}
                </td>
                <td>
                  <Button
                    variant="danger"
                    onClick={() => handleUnassign(student.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
    </>
  );
};

export default StudentsViewPage;
