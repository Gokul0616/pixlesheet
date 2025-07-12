from datetime import datetime
from typing import Dict, List, Optional, Any
import json

class SpreadsheetModel:
    def __init__(self):
        self.spreadsheets = {}
        self.sheets = {}
        self.cells = {}
        self.comments = {}
        self.activities = {}
        self.collaborators = {}
        self.current_ids = {
            'spreadsheet': 1,
            'sheet': 1,
            'cell': 1,
            'comment': 1,
            'activity': 1,
            'collaborator': 1
        }
        self._initialize_sample_data()

    def _initialize_sample_data(self):
        """Initialize with sample data for demonstration"""
        # Create sample spreadsheet
        spreadsheet_id = self._get_next_id('spreadsheet')
        self.spreadsheets[spreadsheet_id] = {
            'id': spreadsheet_id,
            'name': 'Demo Spreadsheet',
            'owner_id': 1,
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat(),
            'is_public': False,
            'share_settings': {
                'allow_edit': True,
                'allow_comment': True,
                'allow_view': True
            }
        }

        # Create sample sheet
        sheet_id = self._get_next_id('sheet')
        self.sheets[sheet_id] = {
            'id': sheet_id,
            'spreadsheet_id': spreadsheet_id,
            'name': 'Sheet1',
            'index': 0,
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }

        # Create sample cells
        sample_cells = [
            {'row': 1, 'column': 1, 'value': 'Revenue', 'data_type': 'text'},
            {'row': 1, 'column': 2, 'value': '50000', 'data_type': 'number'},
            {'row': 1, 'column': 3, 'value': '55000', 'data_type': 'number'},
            {'row': 2, 'column': 1, 'value': 'Expenses', 'data_type': 'text'},
            {'row': 2, 'column': 2, 'value': '35000', 'data_type': 'number'},
            {'row': 2, 'column': 3, 'value': '38000', 'data_type': 'number'},
            {'row': 3, 'column': 1, 'value': 'Profit', 'data_type': 'text'},
            {'row': 3, 'column': 2, 'value': '=B1-B2', 'data_type': 'formula', 'formula': '=B1-B2'},
            {'row': 3, 'column': 3, 'value': '=C1-C2', 'data_type': 'formula', 'formula': '=C1-C2'},
        ]

        for cell_data in sample_cells:
            cell_id = self._get_next_id('cell')
            self.cells[cell_id] = {
                'id': cell_id,
                'sheet_id': sheet_id,
                'row': cell_data['row'],
                'column': cell_data['column'],
                'value': cell_data['value'],
                'formula': cell_data.get('formula'),
                'data_type': cell_data['data_type'],
                'formatting': {},
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }

    def _get_next_id(self, entity_type: str) -> int:
        """Get the next available ID for an entity type"""
        current_id = self.current_ids[entity_type]
        self.current_ids[entity_type] += 1
        return current_id

    # Spreadsheet methods
    def get_spreadsheet(self, spreadsheet_id: int) -> Optional[Dict]:
        return self.spreadsheets.get(spreadsheet_id)

    def get_spreadsheets_by_user(self, user_id: int) -> List[Dict]:
        return [s for s in self.spreadsheets.values() if s['owner_id'] == user_id]

    def create_spreadsheet(self, data: Dict) -> Dict:
        spreadsheet_id = self._get_next_id('spreadsheet')
        spreadsheet = {
            'id': spreadsheet_id,
            **data,
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        self.spreadsheets[spreadsheet_id] = spreadsheet
        return spreadsheet

    def update_spreadsheet(self, spreadsheet_id: int, updates: Dict) -> Optional[Dict]:
        if spreadsheet_id not in self.spreadsheets:
            return None
        
        self.spreadsheets[spreadsheet_id].update(updates)
        self.spreadsheets[spreadsheet_id]['updated_at'] = datetime.now().isoformat()
        return self.spreadsheets[spreadsheet_id]

    # Sheet methods
    def get_sheets_by_spreadsheet(self, spreadsheet_id: int) -> List[Dict]:
        return [s for s in self.sheets.values() if s['spreadsheet_id'] == spreadsheet_id]

    def get_sheet(self, sheet_id: int) -> Optional[Dict]:
        return self.sheets.get(sheet_id)

    def create_sheet(self, data: Dict) -> Dict:
        sheet_id = self._get_next_id('sheet')
        sheet = {
            'id': sheet_id,
            **data,
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        self.sheets[sheet_id] = sheet
        return sheet

    def update_sheet(self, sheet_id: int, updates: Dict) -> Optional[Dict]:
        if sheet_id not in self.sheets:
            return None
        
        self.sheets[sheet_id].update(updates)
        self.sheets[sheet_id]['updated_at'] = datetime.now().isoformat()
        return self.sheets[sheet_id]

    def delete_sheet(self, sheet_id: int) -> bool:
        if sheet_id not in self.sheets:
            return False
        
        del self.sheets[sheet_id]
        # Also delete all cells in this sheet
        cells_to_delete = [cid for cid, cell in self.cells.items() if cell['sheet_id'] == sheet_id]
        for cell_id in cells_to_delete:
            del self.cells[cell_id]
        return True

    # Cell methods
    def get_cells_by_sheet(self, sheet_id: int) -> List[Dict]:
        return [c for c in self.cells.values() if c['sheet_id'] == sheet_id]

    def get_cell(self, sheet_id: int, row: int, column: int) -> Optional[Dict]:
        for cell in self.cells.values():
            if cell['sheet_id'] == sheet_id and cell['row'] == row and cell['column'] == column:
                return cell
        return None

    def create_cell(self, data: Dict) -> Dict:
        cell_id = self._get_next_id('cell')
        cell = {
            'id': cell_id,
            **data,
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        self.cells[cell_id] = cell
        return cell

    def update_cell(self, cell_id: int, updates: Dict) -> Optional[Dict]:
        if cell_id not in self.cells:
            return None
        
        self.cells[cell_id].update(updates)
        self.cells[cell_id]['updated_at'] = datetime.now().isoformat()
        return self.cells[cell_id]

    def update_cell_by_position(self, sheet_id: int, row: int, column: int, updates: Dict) -> Dict:
        existing_cell = self.get_cell(sheet_id, row, column)
        
        if existing_cell:
            self.update_cell(existing_cell['id'], updates)
            return existing_cell
        else:
            return self.create_cell({
                'sheet_id': sheet_id,
                'row': row,
                'column': column,
                'value': updates.get('value', ''),
                'formula': updates.get('formula'),
                'data_type': updates.get('data_type', 'text'),
                'formatting': updates.get('formatting', {})
            })

    # Comment methods
    def get_comments_by_cell(self, cell_id: int) -> List[Dict]:
        return [c for c in self.comments.values() if c['cell_id'] == cell_id]

    def create_comment(self, data: Dict) -> Dict:
        comment_id = self._get_next_id('comment')
        comment = {
            'id': comment_id,
            **data,
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        self.comments[comment_id] = comment
        return comment

    # Activity methods
    def get_activities_by_spreadsheet(self, spreadsheet_id: int) -> List[Dict]:
        return [a for a in self.activities.values() if a['spreadsheet_id'] == spreadsheet_id]

    def create_activity(self, data: Dict) -> Dict:
        activity_id = self._get_next_id('activity')
        activity = {
            'id': activity_id,
            **data,
            'created_at': datetime.now().isoformat()
        }
        self.activities[activity_id] = activity
        return activity

    # Collaborator methods
    def get_collaborators_by_spreadsheet(self, spreadsheet_id: int) -> List[Dict]:
        return [c for c in self.collaborators.values() if c['spreadsheet_id'] == spreadsheet_id]

    def create_collaborator(self, data: Dict) -> Dict:
        collaborator_id = self._get_next_id('collaborator')
        collaborator = {
            'id': collaborator_id,
            **data,
            'added_at': datetime.now().isoformat()
        }
        self.collaborators[collaborator_id] = collaborator
        return collaborator
