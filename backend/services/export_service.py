import json
import csv
import io
from dicttoxml import dicttoxml
from fastapi.responses import StreamingResponse, Response
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

def format_json(record) -> Response:
    data = {
        "id": record.id,
        "location_name": record.location_name,
        "latitude": record.latitude,
        "longitude": record.longitude,
        "start_date": str(record.start_date),
        "end_date": str(record.end_date),
        "weather_data": json.loads(record.temperature_data) if record.temperature_data else [],
        "created_at": str(record.created_at)
    }
    return Response(content=json.dumps(data, indent=4), media_type="application/json", headers={"Content-Disposition": f"attachment; filename=record_{record.id}.json"})

def format_csv(record) -> StreamingResponse:
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow(["Location", "Latitude", "Longitude", "Start Date", "End Date", "Created At"])
    writer.writerow([record.location_name, record.latitude, record.longitude, record.start_date, record.end_date, record.created_at])
    writer.writerow([])
    writer.writerow(["Date", "Condition", "Description", "Max Temp (°C)", "Min Temp (°C)", "Precipitation (mm)"])
    
    weather_data = json.loads(record.temperature_data) if record.temperature_data else []
    for day in weather_data:
        writer.writerow([day.get("date"), day.get("condition"), day.get("description"), day.get("temp_max"), day.get("temp_min"), day.get("precipitation")])
        
    output.seek(0)
    return StreamingResponse(iter([output.getvalue()]), media_type="text/csv", headers={"Content-Disposition": f"attachment; filename=record_{record.id}.csv"})

def format_xml(record) -> Response:
    data = {
        "WeatherRecord": {
            "id": record.id,
            "location_name": record.location_name,
            "latitude": record.latitude,
            "longitude": record.longitude,
            "start_date": str(record.start_date),
            "end_date": str(record.end_date),
            "weather_data": json.loads(record.temperature_data) if record.temperature_data else []
        }
    }
    xml_bytes = dicttoxml(data, custom_root='WeathexExport', attr_type=False)
    return Response(content=xml_bytes, media_type="application/xml", headers={"Content-Disposition": f"attachment; filename=record_{record.id}.xml"})

def format_markdown(record) -> Response:
    md_content = f"# Weather Record: {record.location_name}\n\n"
    md_content += f"**Record ID:** {record.id}  \n"
    md_content += f"**Coordinates:** {record.latitude}, {record.longitude}  \n"
    md_content += f"**Date Range:** {record.start_date} to {record.end_date}  \n"
    md_content += f"**Created At:** {record.created_at}  \n\n"
    md_content += "## Daily Weather Data\n\n"
    md_content += "| Date | Description | Max Temp (°C) | Min Temp (°C) | Precipitation (mm) |\n"
    md_content += "|------|-------------|---------------|---------------|--------------------|\n"
    
    weather_data = json.loads(record.temperature_data) if record.temperature_data else []
    for day in weather_data:
        md_content += f"| {day.get('date')} | {day.get('description')} | {day.get('temp_max')} | {day.get('temp_min')} | {day.get('precipitation')} |\n"
        
    return Response(content=md_content, media_type="text/markdown", headers={"Content-Disposition": f"attachment; filename=record_{record.id}.md"})

def format_pdf(record) -> StreamingResponse:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph(f"Weather Record: {record.location_name}", styles['Title']))
    elements.append(Spacer(1, 12))
    elements.append(Paragraph(f"<b>Record ID:</b> {record.id}", styles['Normal']))
    elements.append(Paragraph(f"<b>Coordinates:</b> {record.latitude}, {record.longitude}", styles['Normal']))
    elements.append(Paragraph(f"<b>Date Range:</b> {record.start_date} to {record.end_date}", styles['Normal']))
    elements.append(Paragraph(f"<b>Created At:</b> {record.created_at}", styles['Normal']))
    elements.append(Spacer(1, 24))
    elements.append(Paragraph("Daily Weather Data", styles['Heading2']))
    elements.append(Spacer(1, 12))

    data = [["Date", "Description", "Max Temp (°C)", "Min Temp (°C)", "Precip (mm)"]]
    weather_data = json.loads(record.temperature_data) if record.temperature_data else []
    for day in weather_data:
        data.append([
            day.get('date', ''),
            day.get('description', ''),
            str(day.get('temp_max', '')),
            str(day.get('temp_min', '')),
            str(day.get('precipitation', ''))
        ])

    table = Table(data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    elements.append(table)

    doc.build(elements)
    buffer.seek(0)
    
    return StreamingResponse(buffer, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=record_{record.id}.pdf"})