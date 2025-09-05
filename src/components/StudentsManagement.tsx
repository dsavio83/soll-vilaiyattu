import React, { useState, useEffect } from 'react';
import { mongodb } from '@/integrations/mongodb/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Download, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Student {
  _id?: string;
  id?: string;
  admission_number: string;
  name: string;
  class: string;
}

const StudentsManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const { data, error } = await mongodb
        .from('students')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error loading students:', error);
      } else {
        setStudents(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setIsAddingNew(false);
  };

  const handleDelete = async (student: Student) => {
    if (!window.confirm(`Are you sure you want to delete ${student.name}?`)) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await mongodb
        .from('students')
        .eq('_id', student._id || student.id)
        .delete();

      if (error) {
        console.error('Error deleting student:', error);
        toast({
          title: "Error",
          description: "Failed to delete student.",
          variant: "destructive",
        });
      } else {
        setStudents(students.filter(s => s._id !== student._id && s.id !== student.id));
        toast({
          title: "Success",
          description: "Student deleted successfully.",
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete ALL students? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await mongodb
        .from('students')
        .neq('_id', '000000000000000000000000')
        .delete();

      if (error) {
        console.error('Error deleting all students:', error);
        toast({
          title: "Error",
          description: "Failed to delete all students.",
          variant: "destructive",
        });
      } else {
        setStudents([]);
        toast({
          title: "Success",
          description: "All students deleted successfully.",
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingStudent) return;

    setLoading(true);
    try {
      const { id, admission_number, name, class: studentClass } = editingStudent;

      const updateData = {
        admission_number,
        name,
        class: studentClass
      };

      if (isAddingNew) {
        const { data, error } = await mongodb
          .from('students')
          .insert([updateData]);

        if (error) {
          console.error('Error adding student:', error);
          toast({
            title: "Error",
            description: "Failed to add student.",
            variant: "destructive",
          });
        } else if (data && data.length > 0) {
          setStudents([...students, data[0]]);
          toast({
            title: "Success",
            description: "Student added successfully.",
          });
        }
      } else {
        const { error } = await mongodb
          .from('students')
          .eq('id', id)
          .update(updateData);

        if (error) {
          console.error('Error updating student:', error);
          toast({
            title: "Error",
            description: "Failed to update student.",
            variant: "destructive",
          });
        } else {
          setStudents(students.map(student => (student.id === id ? editingStudent : student)));
          toast({
            title: "Success",
            description: "Student updated successfully.",
          });
        }
      }
      handleCancel();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingStudent(null);
    setIsAddingNew(false);
  };

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Admission Number,Name,Class\n"
      + students.map(s => `${s.admission_number},${s.name},${s.class}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "students.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredStudents = students.filter(student => {
    const searchLower = searchQuery.toLowerCase();
    const nameMatch = student.name.toLowerCase().includes(searchLower);
    const admissionMatch = student.admission_number.toLowerCase().includes(searchLower);
    const classMatch = !selectedClass || student.class === selectedClass;

    return (nameMatch || admissionMatch) && classMatch;
  });

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      // Skip header row
      const dataLines = lines.slice(1);
      const studentsToImport = [];

      for (const line of dataLines) {
        const [admission_number, name, studentClass] = line.split(',').map(item => item.trim());
        
        if (admission_number && name && studentClass) {
          studentsToImport.push({
            admission_number,
            name,
            class: studentClass
          });
        }
      }

      if (studentsToImport.length === 0) {
        toast({
          title: "Error",
          description: "No valid student data found in CSV file.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await mongodb
        .from('students')
        .insert(studentsToImport);

      if (error) {
        console.error('Error importing students:', error);
        toast({
          title: "Error",
          description: "Failed to import students. Some records may already exist.",
          variant: "destructive",
        });
      } else {
        setStudents([...students, ...(data || [])]);
        toast({
          title: "Success",
          description: `Successfully imported ${data?.length || 0} students.`,
        });
      }
    } catch (error) {
      console.error('Error reading file:', error);
      toast({
        title: "Error",
        description: "Failed to read CSV file.",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg rounded-lg">
        <CardHeader className="bg-gray-50 dark:bg-gray-800 p-4 border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold text-gray-800 dark:text-white whitespace-nowrap">Students Management</CardTitle>
            <div className="flex gap-2">
              <Button onClick={() => {
                setIsAddingNew(true);
                setEditingStudent({
                  admission_number: '',
                  name: '',
                  class: '',
                });
              }} className="flex flex-col items-center gap-1 bg-blue-600 text-white hover:bg-blue-700 p-2">
                <Plus className="w-4 h-4" />
                <span>Add Student</span>
              </Button>
              <Button onClick={handleDeleteAll} variant="destructive" className="flex flex-col items-center gap-1 p-2">
                <Trash2 className="w-4 h-4" />
                <span>Delete All</span>
              </Button>
              <Button onClick={exportData} variant="outline" className="flex flex-col items-center gap-1 p-2">
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </Button>
              <div className="relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImport}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={importing}
                />
                <Button variant="outline" className="flex flex-col items-center gap-1 p-2" disabled={importing}>
                  <Upload className="w-4 h-4" />
                  <span>{importing ? 'Importing...' : 'Import CSV'}</span>
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-800 mb-2">CSV Import Format</h4>
            <p className="text-blue-700 text-sm">
              Your CSV file should have these columns: <code>Admission Number,Name,Class</code>
            </p>
            <p className="text-blue-600 text-xs mt-1">
              Example: <code>2024001,John Doe,Grade 5</code>
            </p>
          </div>

          {(editingStudent || isAddingNew) && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{isAddingNew ? 'Add New Student' : 'Edit Student'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="admission_number">Admission Number</Label>
                    <Input
                      id="admission_number"
                      value={editingStudent?.admission_number || ''}
                      onChange={(e) => setEditingStudent(prev => prev ? { ...prev, admission_number: e.target.value } : null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={editingStudent?.name || ''}
                      onChange={(e) => setEditingStudent(prev => prev ? { ...prev, name: e.target.value } : null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="class">Class</Label>
                    <Input
                      id="class"
                      value={editingStudent?.class || ''}
                      onChange={(e) => setEditingStudent(prev => prev ? { ...prev, class: e.target.value } : null)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={loading} className="bg-green-600 text-white hover:bg-green-700">
                    {loading ? 'Saving...' : 'Save'}
                  </Button>
                  <Button onClick={handleCancel} variant="outline">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-4 mb-4">
            <Input
              placeholder="Search by name or admission number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="border-gray-300 rounded-md shadow-sm"
            >
              <option value="">All Classes</option>
              {[...new Set(students.map(s => s.class))].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">Admission Number</th>
                  <th scope="col" className="px-6 py-3">Name</th>
                  <th scope="col" className="px-6 py-3">Class</th>
                  <th scope="col" className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student._id || student.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      {student.admission_number}
                    </td>
                    <td className="px-6 py-4">
                      {student.name}
                    </td>
                    <td className="px-6 py-4">
                      {student.class}
                    </td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(student)} className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(student)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentsManagement;
