from flask import request, jsonify
from formula_engine import FormulaEngine
import csv
import io

def register_routes(app, model):
    # Spreadsheet routes
    @app.route('/api/spreadsheets', methods=['GET'])
    def get_spreadsheets():
        try:
            user_id = 1  # TODO: Get from session
            spreadsheets = model.get_spreadsheets_by_user(user_id)
            return jsonify(spreadsheets)
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/api/spreadsheets/<int:spreadsheet_id>', methods=['GET'])
    def get_spreadsheet(spreadsheet_id):
        try:
            spreadsheet = model.get_spreadsheet(spreadsheet_id)
            if not spreadsheet:
                return jsonify({'error': 'Spreadsheet not found'}), 404
            return jsonify(spreadsheet)
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/api/spreadsheets', methods=['POST'])
    def create_spreadsheet():
        try:
            data = request.get_json()
            spreadsheet = model.create_spreadsheet(data)
            return jsonify(spreadsheet), 201
        except Exception as e:
            return jsonify({'error': str(e)}), 400

    @app.route('/api/spreadsheets/<int:spreadsheet_id>', methods=['PUT'])
    def update_spreadsheet(spreadsheet_id):
        try:
            data = request.get_json()
            spreadsheet = model.update_spreadsheet(spreadsheet_id, data)
            if not spreadsheet:
                return jsonify({'error': 'Spreadsheet not found'}), 404
            return jsonify(spreadsheet)
        except Exception as e:
            return jsonify({'error': str(e)}), 400

    # Sheet routes
    @app.route('/api/spreadsheets/<int:spreadsheet_id>/sheets', methods=['GET'])
    def get_sheets(spreadsheet_id):
        try:
            sheets = model.get_sheets_by_spreadsheet(spreadsheet_id)
            return jsonify(sheets)
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/api/spreadsheets/<int:spreadsheet_id>/sheets', methods=['POST'])
    def create_sheet(spreadsheet_id):
        try:
            data = request.get_json()
            data['spreadsheet_id'] = spreadsheet_id
            sheet = model.create_sheet(data)
            return jsonify(sheet), 201
        except Exception as e:
            return jsonify({'error': str(e)}), 400

    @app.route('/api/sheets/<int:sheet_id>', methods=['PUT'])
    def update_sheet(sheet_id):
        try:
            data = request.get_json()
            sheet = model.update_sheet(sheet_id, data)
            if not sheet:
                return jsonify({'error': 'Sheet not found'}), 404
            return jsonify(sheet)
        except Exception as e:
            return jsonify({'error': str(e)}), 400

    @app.route('/api/sheets/<int:sheet_id>', methods=['DELETE'])
    def delete_sheet(sheet_id):
        try:
            success = model.delete_sheet(sheet_id)
            if not success:
                return jsonify({'error': 'Sheet not found'}), 404
            return jsonify({'success': True})
        except Exception as e:
            return jsonify({'error': str(e)}), 400

    # Cell routes
    @app.route('/api/sheets/<int:sheet_id>/cells', methods=['GET'])
    def get_cells(sheet_id):
        try:
            cells = model.get_cells_by_sheet(sheet_id)
            
            # Calculate formula values
            formula_engine = FormulaEngine()
            cell_values = {}
            
            # First pass: set all cell values
            for cell in cells:
                cell_id = f"{chr(64 + cell['column'])}{cell['row']}"
                cell_values[cell_id] = cell['value']
            
            formula_engine.set_cells(cell_values)
            
            # Second pass: calculate formulas
            for cell in cells:
                if cell['data_type'] == 'formula' and cell['formula']:
                    try:
                        result = formula_engine.evaluate(cell['formula'])
                        cell['calculated_value'] = result
                    except:
                        cell['calculated_value'] = '#ERROR'
            
            return jsonify(cells)
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/api/sheets/<int:sheet_id>/cells/<int:row>/<int:column>', methods=['PUT'])
    def update_cell(sheet_id, row, column):
        try:
            data = request.get_json()
            cell = model.update_cell_by_position(sheet_id, row, column, data)
            
            # Log activity
            model.create_activity({
                'spreadsheet_id': 1,  # TODO: Get from sheet
                'user_id': 1,  # TODO: Get from session
                'action': 'cell_updated',
                'details': {
                    'sheet_id': sheet_id,
                    'row': row,
                    'column': column,
                    'value': data.get('value', '')
                }
            })
            
            return jsonify(cell)
        except Exception as e:
            return jsonify({'error': str(e)}), 400

    # Comment routes
    @app.route('/api/cells/<int:cell_id>/comments', methods=['GET'])
    def get_comments(cell_id):
        try:
            comments = model.get_comments_by_cell(cell_id)
            return jsonify(comments)
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/api/cells/<int:cell_id>/comments', methods=['POST'])
    def create_comment(cell_id):
        try:
            data = request.get_json()
            data['cell_id'] = cell_id
            comment = model.create_comment(data)
            return jsonify(comment), 201
        except Exception as e:
            return jsonify({'error': str(e)}), 400

    # Activity routes
    @app.route('/api/spreadsheets/<int:spreadsheet_id>/activities', methods=['GET'])
    def get_activities(spreadsheet_id):
        try:
            activities = model.get_activities_by_spreadsheet(spreadsheet_id)
            return jsonify(activities)
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    # Collaborator routes
    @app.route('/api/spreadsheets/<int:spreadsheet_id>/collaborators', methods=['GET'])
    def get_collaborators(spreadsheet_id):
        try:
            collaborators = model.get_collaborators_by_spreadsheet(spreadsheet_id)
            return jsonify(collaborators)
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    # Export routes
    @app.route('/api/spreadsheets/<int:spreadsheet_id>/export/csv', methods=['GET'])
    def export_csv(spreadsheet_id):
        try:
            sheets = model.get_sheets_by_spreadsheet(spreadsheet_id)
            
            if not sheets:
                return jsonify({'error': 'No sheets found'}), 404
            
            first_sheet = sheets[0]
            cells = model.get_cells_by_sheet(first_sheet['id'])
            
            # Convert cells to CSV format
            max_row = max([c['row'] for c in cells], default=0)
            max_col = max([c['column'] for c in cells], default=0)
            
            # Create CSV data
            csv_data = []
            for row in range(1, max_row + 1):
                csv_row = []
                for col in range(1, max_col + 1):
                    cell = next((c for c in cells if c['row'] == row and c['column'] == col), None)
                    csv_row.append(cell['value'] if cell else '')
                csv_data.append(csv_row)
            
            # Generate CSV string
            output = io.StringIO()
            writer = csv.writer(output)
            writer.writerows(csv_data)
            csv_string = output.getvalue()
            
            return csv_string, 200, {
                'Content-Type': 'text/csv',
                'Content-Disposition': f'attachment; filename="{first_sheet["name"]}.csv"'
            }
        except Exception as e:
            return jsonify({'error': str(e)}), 500
